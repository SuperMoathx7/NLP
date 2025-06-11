// --- Display reviews from CSV ---
async function displayPhoneReviewsFromCSV(phoneName, requestedFeature) {
    const responseDiv = document.getElementById('readyMessage');
    // responseDiv.innerHTML = `${lang_model.fetchingReviews[cur_lang]} "${phoneName}"...`;

    if (!reviewsDataLoaded) {
        // responseDiv.innerHTML = lang_model.reviewDataNotLoaded[cur_lang];
        addMessage(lang_model.reviewDataNotLoaded[cur_lang], false)
        return;
    }

    const lowerPhoneName = phoneName.toLowerCase();
    // Filter reviews: Model name in reviews.csv should contain the extracted phoneName.
    // This allows "iPhone 15" to match "iPhone 15 128GB", "iPhone 15 256GB", etc.
    const matchingReviews = reviewsData.filter(review =>
        review.Model && typeof review.Model === 'string' && review.Model.toLowerCase().includes(lowerPhoneName)
    );

    if (matchingReviews.length > 0) {
        let htmlResponse = '';
        if (requestedFeature && requestedFeature.toLowerCase() !== 'overall') {
            htmlResponse += `<h5>${lang_model.showingReviewsForFeature[cur_lang].replace("{phoneName}", phoneName).replace("{feature}", requestedFeature)}</h5>`;
        } else {
            htmlResponse += `<h5>${lang_model.showingAllReviews[cur_lang].replace("{phoneName}", phoneName)}</h5>`;
        }



        // Limit number of reviews shown, e.g., top 5 or random 5
        const reviewsToShow = bestReviews(matchingReviews, requestedFeature).slice(0, 5); 

        reviewsToShow.forEach(review => {
            htmlResponse += `
                <div class="review-item">
                    ${generateStarRating(parseFloat(review.Rating))}
                    <p>${review.Review}</p>
                    <small class="text-muted">Model: ${review.Model} (Company: ${review.Company || 'N/A'})</small>
                </div>`;
        });
        if(cur_lang=="ar"){//send the result to the model to translate it then return it back and show it up to the display....
            let prompt = `Act like an expert HTML content translator with deep knowledge of preserving web structure integrity.

Objective: You will receive an HTML document that contains various tags and elements. Your task is to translate only the text inside the <p> and <h5> tags into Arabic, while keeping the rest of the HTML code unchanged. Do not modify any other tags, attributes, or structural parts of the HTML. The output must be a clean, complete HTML string that mirrors the input structure exactly—except for the translated contents of the specified tags.

Follow these steps meticulously:

Step 1: Identify and extract the contents of all <p> and <h5> tags in the HTML string.

Step 2: Translate only the textual content found inside these tags into the target language, without affecting any HTML tags, inline styles, classes, or attributes.

Step 3: Replace the original text within each <p> and <h5> tag with the translated version while preserving the rest of the document exactly as it is.

Step 4: Return the full HTML document with the updated translations, ensuring that it remains valid and correctly formatted.

Step 5: Do not add any commentary or explanation—just return the updated HTML string.

Here is the HTML content for translation:
${htmlResponse}

Take a deep breath and work on this problem step-by-step.
`;
            // responseDiv.innerHTML = await getResponse(prompt);
            let result = await getResponse(prompt);
            addMessage(result, false)
        }
        else {
            // responseDiv.innerHTML = htmlResponse;
            // console.log(htmlResponse);
            addMessage(htmlResponse, false)
        }
    } else {
        // responseDiv.innerHTML = lang_model.noReviewsFound[cur_lang].replace("{phoneName}", phoneName);
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