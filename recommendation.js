let properties = ["company", "ram", "battery", "processor", "camera", "screen"]
let dummy = ["Apple", "8", "4000", "bionic", "48", "6.1"]
var counter = 0

async function findPhoneRecommendations(text) {
    const responseDiv = document.getElementById('response');
    responseDiv.innerHTML = 'Searching...';

    let criteria = await extractCriteria(text)
    let sorted_phones = getPhones(criteria)
    let final_phones = getFinalPhones(sorted_phones)

    counter = 0
    let maxPoint = sorted_phones.length > 0 ? sorted_phones[0].points : null
    showPhones(final_phones, maxPoint)
}

function showPhones(final_phones, maxPoint) {
    counter += 10
    const responseDiv = document.getElementById('response');
    let htmlResponse = `<h4 class="mb-3">${getResultMessage(criteria, maxPoint)}</h4>`;
    final_phones.slice(0, counter).forEach(phone => {
        htmlResponse += `
            <div class="phone-card card border-0 shadow-sm hover-shadow transition-all mb-3">
                <div class="card-body p-4">
                    <h5 class="card-title fw-bold text-primary mb-3">${phone['Model Name'] || 'Unknown Model'}</h5>
                    <ul class="list-unstyled mb-0">
                        ${phone.RAM_GB ? `<li class="d-flex align-items-center mb-2"><span class="badge bg-light text-dark me-2"><i class="fas fa-memory me-1"></i> RAM:</span> ${phone.RAM_GB} GB</li>` : ''}
                        ${phone.Battery_mAh ? `<li class="d-flex align-items-center mb-2"><span class="badge bg-light text-dark me-2"><i class="fas fa-battery-three-quarters me-1"></i> Battery:</span> ${phone.Battery_mAh} mAh</li>` : ''}
                        ${phone.BackCamera_MP ? `<li class="d-flex align-items-center mb-2"><span class="badge bg-light text-dark me-2"><i class="fas fa-camera me-1"></i> Camera:</span> ${phone.BackCamera_MP} MP</li>` : ''}
                        ${phone.Screen_Inches ? `<li class="d-flex align-items-center mb-2"><span class="badge bg-light text-dark me-2"><i class="fas fa-camera me-1"></i> Screen Size:</span> ${phone.Screen_Inches} inches</li>` : ''}
                        ${phone.Price_USD ? `<li class="d-flex align-items-center mt-3 pt-2 border-top"><span class="fw-bold text-success fs-5">$${phone.Price_USD}</span></li>` : ''}
                    </ul>
                </div>
            </div>
        `;
    });
    if (counter < final_phones.length) {
        htmlResponse += `<button class="btn btn-primary" id="showMoreBtn">Show More</button>`;
        responseDiv.innerHTML = htmlResponse;
        document.getElementById('showMoreBtn')?.addEventListener('click', () => showPhones(final_phones));
    } else {
        responseDiv.innerHTML = htmlResponse
    }
}

async function extractCriteria(text) {

    let listed_properties = properties.map(c => c + (c == "company" ? " (the name of the company that has the phone, don't give the phone name)" : "") + ":\n").join("");
    let prompt =         
    `Hello, I want you to give me information from the following text for the following phone properties from the text,
    Don't give me anything except the following that I'll provide you, if some info is missed, put null instead of it, just give me the answer for each one with new line, without even the name of the property, just the answers,
    give the answers from the following list: {'company': ['apple', 'samsung', 'oneplus', 'vivo', 'iqoo', 'oppo', 'realme', 'xiaomi', 'lenovo', 'motorola', 'huawei', 'nokia', 'sony', 'google', 'tecno', 'infinix', 'honor', 'poco'], 'ram': ['6', '8', '4', '3', '12', '2', '16', '10', '1'], 'battery': ['3600', '4200', '4400', '4500', '3200', '4300', '4325', '2438', '3240', '3095', '4352', '2227', '2815', '3687', '3110', '3046', '3969', '2716', '2658', '3174', '2942', '7608', '8612', '5124', '7812', '9720', '10307', '5000', '4800', '4000', '4700', '3900', '3800', '3700', '6000', '3500', '4050', '3000', '3300', '2600', '11200', '10090', '8400', '8000', '7040', '5100', '5050', '7600', '4510', '4115', '4085', '9510', '11000', '5700', '4100', '3315', '3260', '2300', '3055', '4030', '2000', '4450', '4600', '4830', '4870', '8040', '4805', '5800', '5600', '6400', '8360', '4520', '4350', '4025', '4040', '6500', '5500', '5200', '7100', '8340', '7200', '6100', '5400', '4610', '5110', '3350', '4310', '4020', '4360', '4460', '4815', '4750', '4900', '8200', '10100', '2800', '3140', '3885', '4080', '4680', '4614', '5003', '4410', '4355', '4385', '4575', '5250', '7500', '7000', '9000', '5300', '3750', '5450', '5550', '7250', '8500', '8300', '10000', '10500', '8850', '5160', '5065'], 'processor': ['bionic', 'exynos', 'snapdragon', 'mediatek', 'unisoc', 'speedturm', 'qualcom', 'kirin', 'tensor'], 'camera': ['48', '50', '12', '8', '200', '108', '13', '16', '5', '64', '20', '40', '2', '54', '160', '100'], 'screen': ['6.1', '6.7', '5.4', '5.8', '6.5', '10.9', '10.2', '7.9', '11.0', '12.9', '13.0', '6.8', '6.6', '7.6', '6.4', '6.9', '6.3', '5.3', '6.0', '5.5', '5.7', '5.2', '14.6', '12.4', '8.7', '10.5', '8.0', '10.1', '6.74', '6.72', '7.8', '6.55', '6.43', '6.49', '6.52', '6.78', '6.59', '6.44', '6.41', '6.01', '6.67', '6.28', '11.61', '6.31', '6.58', '6.38', '6.56', '5.88', '6.22', '5.0', '6.51', '6.35', '6.53', '6.39', '6.47', '10.4', '12.3', '7.82', '6.83', '11.6', '12.1', '6.82', '7.1', '11.5', '6.73', '6.36', '6.09', '6.57', '7.93', '7.92', '12.2', '13.2', '5.6', '6.2', '6.34', '6.71', '7.85', '9.7', '6.95', '6.85', '6.63', '7.09', '6.81', '6.76', '12.0', '12.6', '13.5', '6.79']}
    `
    + listed_properties
    + `The text is: ` + text;
    let prompt_response = await getResponse(prompt)
    criteria = {}
    for (var i = 0; i < properties.length; ++i) {
        criteria[properties[i]] = prompt_response.split("\n")[i].toLowerCase().trim()
        // criteria[properties[i]] = dummy[i].toLowerCase()
    }
    return criteria
}

function getPhones(criteria) {
    let point_record = []
    for (const record of mobileData) {
        point_record.push(
            {
                points: getPoints(record, criteria),
                phone: record
            }
        )
    }
    point_record.sort((a, b) => b.points - a.points);
    return point_record
}

function getPoints(record, criteria) {
    var points = 0.0
    for (const c in criteria) {
        let v = criteria[c]
        if (v == "null") {
            continue
        }
        if (c == "company") {
            try {
                points += record["Company Name"].toLowerCase() == v
            } catch {}
        } else if (c == "ram") {
            try {
                let num = record["RAM_GB"]
                let num2 = parseInt(v)
                points += 1 - normalize(Math.abs(num - num2), 0, 16 - 1)
            } catch {}
        } else if (c == "battery") {
            try {
                let num = record["Battery_mAh"]
                let num2 = parseInt(v)
                points += 1 - normalize(Math.abs(num - num2), 0, 11200 - 2000)
            } catch {}
        } else if (c == "processor") {
            try {
                points += record["Processor_Type"].toLowerCase() == v
            } catch {}
        } else if (c == "camera") {
            try {
                let num = record["BackCamera_MP"]
                let num2 = parseInt(v)
                points += 1 - normalize(Math.abs(num - num2), 0, 200 - 2)
            } catch {}
        } else if (c == "screen") {
            try {
                let num = record["Screen_Inches"]
                let num2 = parseInt(v)
                points += 1 - normalize(Math.abs(num - num2), 0, 14.6 - 5.0)
            } catch {}
        }
        // TODO:
    }
    return points
}

function normalize(v, mn, mx) {
    return (v - mn) / (mx - mn)
}

function getFinalPhones(phones) {
    if (phones.length == 0) {
        return []
    }
    let max_point = phones[0]["points"]
    let final_phones = [], final_phones_models = {}
    for (var rep = 0; rep < 50; ++rep) {
        let unique_companies = {}
        for (const phone of phones) {
            if (max_point - phone["points"] > 0.5) {
                break
            }
            if (phone["phone"]["Model Name"] in final_phones_models || phone["phone"]["Company Name"] in unique_companies) {
                continue
            }
            final_phones.push(phone)
            final_phones_models[phone["phone"]["Model Name"]] = 1
            unique_companies[phone["phone"]["Company Name"]] = 1
        }
        if (final_phones.length >= 50) {
            break
        }
    }
    final_phones.sort((a, b) => a["points"] == b["points"] ? b["phone"]["Price_USD"] - a["phone"]["Price_USD"] : b["points"] - a["points"])
    return final_phones.map(p => p["phone"])
}
function getResultMessage(criteria, maxPoint) {
    const isArabic = cur_lang === "ar";

    if (maxPoint == null) {
        return isArabic
            ? "لا توجد هواتف تطابق هذه الشروط، حاول مرة أخرى"
            : "No phones satisfy these conditions, please try again";
    }

    let not_null = 0;
    for (let i = 0; i < properties.length; ++i) {
        if (criteria[properties[i]] !== "null") {
            not_null += 1;
        }
    }

    if (maxPoint > not_null - 0.75) {
        return isArabic
            ? "إليك بعض الهواتف التي تطابق طلبك:"
            : "Here are some phones that match your request:";
    } else if (maxPoint > not_null - 0.5) {
        return isArabic
            ? "إليك بعض الهواتف القريبة من طلبك:"
            : "Here are some phones that are close to your request:";
    } else if (maxPoint > not_null - 1) {
        return isArabic
            ? "إليك بعض الهواتف التي تطابق جزءاً من طلبك:"
            : "Here are some phones that match some of your request:";
    } else {
        return isArabic
            ? "لا توجد هواتف تطابق طلبك تماماً، إليك الأقرب:"
            : "No phones match your request, here are the closest ones:";
    }
}


async function getResponse(input) {
    const responseDiv = document.getElementById('response');
    try {
        // IMPORTANT: This API key is visible in the frontend code.
        // For a real application, this should be handled via a secure backend.
        //const apiKey = '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';
        //const apiKey = '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';
        const apiKey = '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';
        const response = await fetch(
            'https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'deepseek/deepseek-chat:free', // Using a reliable free model
                    messages: [{ role: 'user', content: input }],
                }),
            },
        );
        
        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }

        const data = await response.json();
        const markdownText = data.choices?.[0]?.message?.content || 'No response received.';
        return markdownText;

    } catch (error) {
        console.error("API Error:", error);
        responseDiv.innerHTML = 'Error communicating with the AI model: ' + error.message;
    }
}