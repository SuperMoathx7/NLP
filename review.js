// Global variable to track conversation context
let conversationContext = {
    lastPhoneDiscussed: null,
    lastFeatureDiscussed: null,
    conversationType: null, // 'review', 'recommendation', 'general'
    userPreferences: {}
};

// --- Display reviews from CSV with conversational approach ---
async function displayPhoneReviewsFromCSV(phoneName, requestedFeature) {
    if (!reviewsDataLoaded) {
        addMessage(lang_model.reviewDataNotLoaded[cur_lang], false)
        return;
    }

    // Update conversation context
    conversationContext.lastPhoneDiscussed = phoneName;
    conversationContext.lastFeatureDiscussed = requestedFeature;
    conversationContext.conversationType = 'review';

    const lowerPhoneName = phoneName.toLowerCase();
    const matchingReviews = reviewsData.filter(review =>
        review.Model && typeof review.Model === 'string' && review.Model.toLowerCase().includes(lowerPhoneName)
    );

    if (matchingReviews.length > 0) {
        // Generate conversational response with AI
        const reviewsToShow = bestReviews(matchingReviews, requestedFeature).slice(0, 5);
        
        // Create a conversational review summary
        await generateConversationalReviewResponse(phoneName, requestedFeature, reviewsToShow, matchingReviews.length);
        
    } else {
        addMessage(lang_model.noReviewsFound[cur_lang].replace("{phoneName}", phoneName), false)
    }
}

function pointReview(review, requestedFeature) {
    console.log(requestedFeature)
    let cnt = review.Rating
    for (p of properties) {
        if (requestedFeature.toLowerCase().includes(p)) {
            cnt += (review.Review.toLowerCase().split(p).length - 1) * 5
        }
    }
    return cnt
}

function bestReviews(matchingReviews, requestedFeature) {
    matchingReviews.sort((a, b) => pointReview(b, requestedFeature) - pointReview(a, requestedFeature))
    return matchingReviews
}

// --- Helper to generate star ratings ---
function generateStarRating(rating) {
    if (typeof rating !== 'number' || rating < 0 || rating > 5) {
        return '<span>No rating</span>';
    }
    let stars = '';
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="fas fa-star"></i>';
    }
    if (halfStar) {
        stars += '<i class="fas fa-star-half-alt"></i>';
    }
    for (let i = 0; i < emptyStars; i++) {
        stars += '<i class="far fa-star"></i>'; // Using far for empty star
    }
    return `<div class="star-rating">${stars} (${rating.toFixed(1)})</div>`;
}

// --- Generate conversational review response ---
async function generateConversationalReviewResponse(phoneName, requestedFeature, reviewsToShow, totalReviews) {
    // Prepare review data for AI analysis
    const reviewTexts = reviewsToShow.map(r => r.Review).join(' | ');
    const avgRating = (reviewsToShow.reduce((sum, r) => sum + parseFloat(r.Rating), 0) / reviewsToShow.length).toFixed(1);
    
    let prompt = `You are a phone expert. Give a SHORT, friendly response about the ${phoneName}.

User asked about: ${requestedFeature === 'overall' ? 'general reviews' : requestedFeature}
Reviews (${totalReviews} total, avg ${avgRating}/5): ${reviewTexts}

Provide a BRIEF response (2-3 sentences max) that:
1. Gives key insight about ${requestedFeature === 'overall' ? 'the phone' : requestedFeature}
2. Ends with a short follow-up question

Keep it conversational but concise.
${cur_lang === 'ar' ? 'Respond in Arabic.' : 'Respond in English.'}

Previous context: ${getAllChat()}`;

    try {
        const conversationalResponse = await getResponse(prompt);
        addMessage(conversationalResponse, false);
        
        // Also show 2 top reviews as supporting evidence
        let reviewsHtml = `<div class="review-evidence">
            <h6>${lang_model.supportingEvidence[cur_lang]}</h6>`;
        
        reviewsToShow.slice(0, 2).forEach(review => {
            reviewsHtml += `
                <div class="review-item-compact">
                    ${generateStarRating(parseFloat(review.Rating))}
                    <p class="review-text">"${review.Review}"</p>
                </div>`;
        });
        reviewsHtml += `</div>`;
        
        // Translate review content if in Arabic
        if (cur_lang === 'ar') {
            reviewsHtml = await translateReviewContent(reviewsHtml);
        }
        
        addMessage(reviewsHtml, false);
        
    } catch (error) {
        console.error('Error generating conversational response:', error);
        // Fallback to original format
        const fallbackMessage = cur_lang === 'ar' 
            ? `بناء على ${totalReviews} مراجعة بمتوسط تقييم ${avgRating}/5 للـ ${phoneName}:`
            : `Based on ${totalReviews} reviews with an average rating of ${avgRating}/5 for the ${phoneName}:`;
        addMessage(fallbackMessage, false);
    }
}

// --- Check if user question is related to current conversation context ---
async function checkConversationContinuation(userInput) {
    if (!conversationContext.lastPhoneDiscussed) {
        console.log('No previous phone discussion found');
        return false;
    }
    
    console.log('Checking continuation for:', userInput, 'Previous phone:', conversationContext.lastPhoneDiscussed);
    
    const lowerInput = userInput.toLowerCase();
    
    // Check for direct phone reference keywords
    const phoneReferenceKeywords = [
        'this phone', 'that phone', 'it', 'its', 'the phone',
        'هذا الهاتف', 'ذلك الهاتف', 'الهاتف', 'هو', 'به'
    ];
    
    // Check for feature keywords
    const featureKeywords = [
        'battery', 'charge', 'charging', 'power', 'life',
        'camera', 'photo', 'picture', 'photography', 'lens',
        'performance', 'speed', 'fast', 'slow', 'processor',
        'display', 'screen', 'size', 'brightness',
        'price', 'cost', 'expensive', 'cheap', 'worth',
        'design', 'build', 'quality', 'weight',
        'storage', 'memory', 'space',
        'review', 'opinion', 'thoughts',
        // Arabic equivalents
        'بطارية', 'شحن', 'طاقة', 'عمر',
        'كاميرا', 'صورة', 'تصوير',
        'أداء', 'سرعة', 'معالج',
        'شاشة', 'عرض', 'حجم',
        'سعر', 'تكلفة', 'غالي', 'رخيص',
        'تصميم', 'جودة', 'وزن',
        'تخزين', 'ذاكرة', 'مساحة',
        'مراجعة', 'رأي', 'تقييم'
    ];
    
    // Check if input contains phone reference OR feature keywords
    const hasPhoneReference = phoneReferenceKeywords.some(keyword => 
        lowerInput.includes(keyword.toLowerCase())
    );
    
    const hasFeatureKeywords = featureKeywords.some(keyword => 
        lowerInput.includes(keyword.toLowerCase())
    );
    
    // Special patterns that indicate continuation
    const continuationPatterns = [
        /review.*phone/i,
        /phone.*review/i,
        /what about/i,
        /how about/i,
        /tell me about/i,
        /give me.*review/i,
        /.*review.*of.*(this|that|the phone)/i,
        /ماذا عن/i,
        /أخبرني عن/i,
        /أعطني.*مراجعة/i
    ];
    
    const hasPattern = continuationPatterns.some(pattern => pattern.test(userInput));
    
    if (hasPhoneReference || hasFeatureKeywords || hasPattern) {
        console.log('Found continuation indicators:', {
            phoneReference: hasPhoneReference,
            featureKeywords: hasFeatureKeywords,
            pattern: hasPattern
        });
        return true;
    }
    
    // Final check: if the input is short and seems like a follow-up
    if (userInput.length < 50 && (hasFeatureKeywords || lowerInput.includes('review'))) {
        console.log('Short input with relevant keywords, treating as continuation');
        return true;
    }
    
    console.log('No continuation indicators found');
    return false;
}

// --- Handle follow-up questions about the current phone ---
async function handleFollowUpQuestion(userInput) {
    const phoneName = conversationContext.lastPhoneDiscussed;
    
    if (!phoneName) {
        console.error('No phone in context for follow-up question');
        addMessage(lang_model.conversationError[cur_lang], false);
        return;
    }
    
    try {
        // Enhanced feature extraction with direct keyword matching
        let detectedFeature = 'overall';
        const lowerInput = userInput.toLowerCase();
        
        // Direct feature mapping
        const featureMap = {
            'battery': ['battery', 'charge', 'charging', 'power', 'life', 'بطارية', 'شحن', 'طاقة'],
            'camera': ['camera', 'photo', 'picture', 'photography', 'lens', 'كاميرا', 'صورة', 'تصوير'],
            'performance': ['performance', 'speed', 'fast', 'slow', 'processor', 'lag', 'أداء', 'سرعة', 'معالج'],
            'display': ['display', 'screen', 'size', 'brightness', 'color', 'شاشة', 'عرض', 'حجم'],
            'price': ['price', 'cost', 'expensive', 'cheap', 'worth', 'value', 'سعر', 'تكلفة', 'غالي'],
            'design': ['design', 'build', 'quality', 'weight', 'look', 'feel', 'تصميم', 'جودة', 'وزن'],
            'storage': ['storage', 'memory', 'space', 'gb', 'تخزين', 'ذاكرة', 'مساحة']
        };
        
        // Find matching feature
        for (const [feature, keywords] of Object.entries(featureMap)) {
            if (keywords.some(keyword => lowerInput.includes(keyword))) {
                detectedFeature = feature;
                break;
            }
        }
        
        console.log('Detected feature via keywords:', detectedFeature);
        
        // If still 'overall', try AI extraction as fallback
        if (detectedFeature === 'overall') {
            const featurePrompt = `What phone feature is asked about? One word only.

"${userInput}"

Options: battery, camera, performance, display, price, design, storage, overall

Answer:`;

            try {
                const aiFeature = await getResponse(featurePrompt);
                const cleanAiFeature = aiFeature.trim().toLowerCase();
                if (Object.keys(featureMap).includes(cleanAiFeature)) {
                    detectedFeature = cleanAiFeature;
                    console.log('AI detected feature:', detectedFeature);
                }
            } catch (aiError) {
                console.log('AI feature detection failed, using keyword result:', detectedFeature);
            }
        }
        
        // Update context
        conversationContext.lastFeatureDiscussed = detectedFeature;
        
        // Get reviews for this specific feature or general reviews
        const lowerPhoneName = phoneName.toLowerCase();
        const matchingReviews = reviewsData.filter(review =>
            review.Model && typeof review.Model === 'string' && review.Model.toLowerCase().includes(lowerPhoneName)
        );
        
        if (matchingReviews.length > 0) {
            const reviewsToShow = bestReviews(matchingReviews, detectedFeature).slice(0, 3);
            
            // Generate a simple contextual response
            const reviewTexts = reviewsToShow.map(r => r.Review).slice(0, 2).join(' ');
            
            const contextualPrompt = `About ${phoneName} ${detectedFeature}: Based on reviews: "${reviewTexts}" 

Give 1-2 sentences answering "${userInput}". Add short question.
${cur_lang === 'ar' ? 'Arabic.' : 'English.'}`;

            const contextualResponse = await getResponse(contextualPrompt);
            addMessage(contextualResponse, false);
            
            // Show supporting review with translation
            if (reviewsToShow.length > 0) {
                const bestReview = reviewsToShow[0];
                let reviewHtml = `<div class="review-item-compact">
                    ${generateStarRating(parseFloat(bestReview.Rating))}
                    <p class="review-text">"${bestReview.Review}"</p>
                </div>`;
                
                // Translate review content if in Arabic
                if (cur_lang === 'ar') {
                    reviewHtml = await translateReviewContent(reviewHtml);
                }
                
                addMessage(reviewHtml, false);
            }
        } else {
            const noReviewsMessage = lang_model.noAdditionalReviews[cur_lang]
                .replace("{phoneName}", phoneName)
                .replace("{feature}", detectedFeature);
            addMessage(noReviewsMessage, false);
        }
        
    } catch (error) {
        console.error('Error handling follow-up question:', error);
        console.error('Error details:', error.message);
        
        // Simple fallback response
        const fallbackMessage = cur_lang === 'ar' 
            ? `عذراً، لا يمكنني الإجابة على سؤالك حول ${phoneName} الآن. جرب سؤالاً آخر؟`
            : `Sorry, I can't answer your question about ${phoneName} right now. Try asking differently?`;
        addMessage(fallbackMessage, false);
    }
}

// --- Translation helper for reviews ---
async function translateReviewContent(htmlContent) {
    if (cur_lang !== 'ar') {
        return htmlContent;
    }
    
    const prompt = `Translate ONLY the review text content inside quotes to natural Arabic while preserving all HTML structure.

RULES:
1. Translate only text inside quotes ("review text here") 
2. Keep ALL HTML tags, classes, attributes exactly the same
3. Don't translate: brand names (iPhone, Samsung), model numbers, technical specs
4. Keep star ratings, numbers, and HTML structure unchanged
5. Translate to natural, fluent Arabic

Example:
Input: <p class="review-text">"The camera is excellent and battery life is good"</p>
Output: <p class="review-text">"الكاميرا ممتازة وعمر البطارية جيد"</p>

HTML to translate:
${htmlContent}

Return the complete HTML with only quoted review texts translated to Arabic:`;

    try {
        const translatedContent = await getResponse(prompt);
        return translatedContent;
    } catch (error) {
        console.error('Error translating review content:', error);
        return htmlContent; // Return original if translation fails
    }
}

// --- Enhanced review display with translation ---
async function enhancedReviewDisplay(reviewsHtml) {
    // Translate review content to Arabic if needed
    const translatedHtml = await translateReviewContent(reviewsHtml);
    
    // Display the (translated) reviews
    addMessage(translatedHtml, false);
}

// --- Enhanced Review Analysis Functions ---

// Analyze sentiment and extract key insights from reviews
function analyzeReviewSentiment(reviews) {
    const analysis = {
        positive: [],
        negative: [],
        neutral: [],
        averageRating: 0
    };
    
    const positiveKeywords = ['excellent', 'great', 'amazing', 'perfect', 'love', 'best', 'outstanding', 'fantastic'];
    const negativeKeywords = ['terrible', 'bad', 'awful', 'hate', 'worst', 'disappointing', 'poor', 'slow'];
    
    let totalRating = 0;
    
    reviews.forEach(review => {
        const rating = parseFloat(review.Rating);
        totalRating += rating;
        const reviewText = review.Review.toLowerCase();
        
        // Sentiment classification
        const positiveScore = positiveKeywords.filter(word => reviewText.includes(word)).length;
        const negativeScore = negativeKeywords.filter(word => reviewText.includes(word)).length;
        
        if (rating >= 4 || positiveScore > negativeScore) {
            analysis.positive.push(review);
        } else if (rating <= 2 || negativeScore > positiveScore) {
            analysis.negative.push(review);
        } else {
            analysis.neutral.push(review);
        }
    });
    
    analysis.averageRating = (totalRating / reviews.length).toFixed(1);
    return analysis;
}

// Generate comprehensive review summary
async function generateReviewSummary(phoneName, reviews, requestedFeature) {
    const analysis = analyzeReviewSentiment(reviews);
    const totalReviews = reviews.length;
    
    const summaryPrompt = `Create a brief review summary for ${phoneName} ${requestedFeature !== 'overall' ? `(${requestedFeature})` : ''}.

Data:
- ${totalReviews} reviews, avg ${analysis.averageRating}/5
- ${analysis.positive.length} positive, ${analysis.negative.length} negative
- Sample reviews: ${reviews.slice(0, 3).map(r => r.Review).join(' | ')}

Provide:
1. One sentence overview
2. Top 2 strengths 
3. Top 2 weaknesses (if any)
4. One recommendation sentence

Keep it concise and conversational.
${cur_lang === 'ar' ? 'Respond in Arabic.' : 'Respond in English.'}`;

    try {
        return await getResponse(summaryPrompt);
    } catch (error) {
        console.error('Error generating summary:', error);
        const fallback = cur_lang === 'ar' 
            ? `بناء على ${totalReviews} مراجعة بمتوسط ${analysis.averageRating}/5 للـ ${phoneName}`
            : `Based on ${totalReviews} reviews with ${analysis.averageRating}/5 average for ${phoneName}`;
        return fallback;
    }
}

// Enhanced review display with analysis and translation
async function displayEnhancedReviews(phoneName, requestedFeature, reviews) {
    const analysis = analyzeReviewSentiment(reviews);
    
    // Generate AI summary
    const summary = await generateReviewSummary(phoneName, reviews, requestedFeature);
    addMessage(summary, false);
    
    // Show rating breakdown
    const ratingBreakdown = generateRatingBreakdown(analysis);
    addMessage(ratingBreakdown, false);
    
    // Show top positive and negative reviews with translation
    if (analysis.positive.length > 0) {
        let positiveHtml = `<div class="review-section positive">
            <h6>✅ ${lang_model.topPositiveReviews[cur_lang]}</h6>
            ${analysis.positive.slice(0, 2).map(review => `
                <div class="review-item-compact positive-review">
                    ${generateStarRating(parseFloat(review.Rating))}
                    <p class="review-text">"${review.Review}"</p>
                </div>
            `).join('')}
        </div>`;
        
        // Translate review content if in Arabic
        if (cur_lang === 'ar') {
            positiveHtml = await translateReviewContent(positiveHtml);
        }
        
        addMessage(positiveHtml, false);
    }
    
    if (analysis.negative.length > 0) {
        let negativeHtml = `<div class="review-section negative">
            <h6>⚠️ ${lang_model.pointsToConsider[cur_lang]}</h6>
            ${analysis.negative.slice(0, 1).map(review => `
                <div class="review-item-compact negative-review">
                    ${generateStarRating(parseFloat(review.Rating))}
                    <p class="review-text">"${review.Review}"</p>
                </div>
            `).join('')}
        </div>`;
        
        // Translate review content if in Arabic
        if (cur_lang === 'ar') {
            negativeHtml = await translateReviewContent(negativeHtml);
        }
        
        addMessage(negativeHtml, false);
    }
}

// Generate rating breakdown visualization
function generateRatingBreakdown(analysis) {
    const total = analysis.positive.length + analysis.negative.length + analysis.neutral.length;
    const positivePercent = Math.round((analysis.positive.length / total) * 100);
    const negativePercent = Math.round((analysis.negative.length / total) * 100);
    
    return `<div class="rating-breakdown">
        <h6>${lang_model.reviewAnalysis[cur_lang]}</h6>
        <div class="rating-bar">
            <div class="positive-bar" style="width: ${positivePercent}%">${positivePercent}% ${lang_model.positive[cur_lang]}</div>
            <div class="negative-bar" style="width: ${negativePercent}%">${negativePercent}% ${lang_model.negative[cur_lang]}</div>
        </div>
        <p class="rating-summary">${analysis.averageRating}/5 ⭐ (${total} ${lang_model.reviews[cur_lang]})</p>
    </div>`;
}

// Suggest follow-up questions based on reviews
function suggestFollowUpQuestions(phoneName, requestedFeature, reviews) {
    const suggestions = [];
    
    if (requestedFeature === 'overall') {
        suggestions.push(
            cur_lang === 'ar' ? 'ما رأيك في البطارية؟' : 'What about the battery?',
            cur_lang === 'ar' ? 'كيف الكاميرا؟' : 'How is the camera?',
            cur_lang === 'ar' ? 'هل يستحق السعر؟' : 'Is it worth the price?'
        );
    } else {
        suggestions.push(
            cur_lang === 'ar' ? 'مقارنة مع هواتف أخرى؟' : 'How does it compare to other phones?',
            cur_lang === 'ar' ? 'أي مشاكل معروفة؟' : 'Any known issues?',
            cur_lang === 'ar' ? 'توصياتك؟' : 'Your recommendation?'
        );
    }
    
    const suggestionsHtml = `<div class="follow-up-suggestions">
        <p><strong>${lang_model.youMightAsk[cur_lang]}</strong></p>
        ${suggestions.map(q => `<button class="suggestion-btn" onclick="document.getElementById('userInput').value='${q}'; sendMessage();">${q}</button>`).join('')}
    </div>`;
    
    return suggestionsHtml;
}