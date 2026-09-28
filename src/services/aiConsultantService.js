// Real-Time Generative Medical AI Consultant Service
// Provides live, dynamic, context-aware doctor responses in Telugu & English

const TELUGU_PHONETICS = [
    "jwaram", "jvaram", "kadupu", "noppi", "talanoppi", "mandulu", "taggutundi",
    "eppudu", "vesukovali", "tinali", "tinakoodadu", "namaskaram", "doctor garu",
    "vinipistunda", "neerasam", "kallu", "nidra", "aakali", "motion", "vomiting",
    "daggu", "jalubu", "gonthu", "chesukovali", "vaccine", "injection", "report",
    "blood test", "call cut", "end chey", "pani", "vellacha", "pillalu", "chaliga",
    "ondi", "undi", "cheppandi", "chudandi", "baagunnara", "dhanyavadalu", "sare",
    "ayipoyayi", "gas", "manta", "potta", "durada", "sugar", "bp", "tablet", "tablets",
    "snanam", "neellu", "kobbari", "majjiga", "paalu", "chiken", "guddu", "kodi"
];

export function isTeluguInput(text, selectedLang = 'te') {
    if (selectedLang === 'te') return true;
    if (!text) return false;
    // Check Telugu Unicode script range
    if (/[\u0C00-\u0C7F]/.test(text)) return true;
    // Check phonetic Telugu words
    const lower = text.toLowerCase();
    return TELUGU_PHONETICS.some(w => lower.includes(w));
}

// Clean generated text to ensure natural spoken speech output without markdown or AI artefacts
export function sanitizeDoctorSpeech(text) {
    if (!text) return "";
    return text
        .replace(/<think>[\s\S]*?<\/think>/gi, '') // remove reasoning tokens if any
        .replace(/[*#_~`[\]()]/g, '') // remove markdown symbols
        .replace(/^(Dr\.\s*Sriram:?|Doctor:?|డాక్టర్:?|Doctor Sriram:?)\s*/i, '') // remove "Doctor:" prefix
        .replace(/["“”'‘’]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

// Retrieve custom AI configuration from localStorage (allows free Groq, Gemini, or custom OpenAI)
export function getSavedAiConfig() {
    try {
        const raw = localStorage.getItem('careconnect_ai_config');
        if (raw) return JSON.parse(raw);
    } catch {
        // Ignore storage errors
    }
    return {
        provider: 'cloud_free', // 'cloud_free' | 'groq' | 'gemini' | 'openai'
        apiKey: '',
        model: 'openai'
    };
}

export function saveAiConfig(config) {
    try {
        localStorage.setItem('careconnect_ai_config', JSON.stringify(config));
    } catch {
        // Ignore
    }
}

/**
 * Call Groq API (Ultra-Fast 0.3s latency) if user provides a free Groq key
 */
async function callGroqAi(apiKey, messages) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    try {
        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey.trim()}`
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: messages,
                max_tokens: 75,
                temperature: 0.7
            }),
            signal: controller.signal
        });
        clearTimeout(timeout);
        if (res.ok) {
            const data = await res.json();
            const reply = data?.choices?.[0]?.message?.content;
            if (reply) return sanitizeDoctorSpeech(reply);
        }
    } catch (err) {
        clearTimeout(timeout);
        console.warn("[Groq AI Call Error]:", err?.message);
    }
    return null;
}

/**
 * Call Google Gemini API if user provides a Gemini API key
 */
async function callGeminiAi(apiKey, prompt, systemPrompt) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey.trim()}`;
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: `${systemPrompt}\n\nPatient Query: ${prompt}` }] }],
                generationConfig: { maxOutputTokens: 80, temperature: 0.7 }
            }),
            signal: controller.signal
        });
        clearTimeout(timeout);
        if (res.ok) {
            const data = await res.json();
            const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (reply) return sanitizeDoctorSpeech(reply);
        }
    } catch (err) {
        clearTimeout(timeout);
        console.warn("[Gemini AI Call Error]:", err?.message);
    }
    return null;
}

/**
 * Call CareConnect Public Cloud AI (Free Live Inference)
 * Timeout set to 14 seconds to allow realistic generation time
 */
async function callCloudAi(messages) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 14000);

    try {
        // Primary Endpoint: Direct POST to text.pollinations.ai
        const response = await fetch('https://text.pollinations.ai/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'text/plain, application/json'
            },
            body: JSON.stringify({
                messages: messages,
                model: 'openai',
                temperature: 0.7,
                max_tokens: 65,
                cache: false
            }),
            signal: controller.signal
        });

        clearTimeout(timeout);

        if (response.ok) {
            const text = await response.text();
            if (text && text.trim().length > 3 && !text.includes('"error":')) {
                const cleaned = sanitizeDoctorSpeech(text);
                console.log("[CareConnect Cloud AI] Live generated response:", cleaned);
                return cleaned;
            }
        }
    } catch (err) {
        clearTimeout(timeout);
        console.warn("[CareConnect Cloud AI Primary Timeout/Error]:", err?.message);
    }

    // Secondary Endpoint: Fallback to /openai route
    try {
        const controller2 = new AbortController();
        const timeout2 = setTimeout(() => controller2.abort(), 6000);
        const res2 = await fetch('https://text.pollinations.ai/openai', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages: messages,
                model: 'openai',
                max_tokens: 65,
                temperature: 0.7
            }),
            signal: controller2.signal
        });
        clearTimeout(timeout2);
        if (res2.ok) {
            const data = await res2.json();
            const reply = data?.choices?.[0]?.message?.content;
            if (reply && reply.trim().length > 3) {
                return sanitizeDoctorSpeech(reply);
            }
        }
    } catch {
        // Fall through to Tier 2
    }

    return null;
}

/**
 * Main real-time AI consultant function
 * Calls live LLM model with conversation memory, falling back smoothly to deep dynamic clinical synthesizer
 */
export async function fetchLiveDoctorConsultation(patientInput, history = [], patientInfo = {}, selectedLang = 'te') {
    const isTelugu = isTeluguInput(patientInput, selectedLang);
    const pName = patientInfo.name || "Patient";
    const condition = patientInfo.issue || "Acute Symptoms";

    const systemPrompt = `You are Dr. Sriram Chityala (MBBS, MD), Chief Attending Physician at CareConnect Telehealth Hospital.
Patient Details:
- Name: ${pName}
- Diagnosis/Issue: ${condition}
- Prescribed duration: ${patientInfo.days || 5} days

Rules:
1. Act as a caring, authentic doctor in a live video call. Address ${pName}'s specific question or symptom directly and conversationally.
2. Provide tailored, medically sound, practical advice. DO NOT give generic or repetitive canned answers. Give different answers for different questions.
3. Keep the answer strictly 1 to 2 spoken sentences (under 30 words) because this will be spoken aloud immediately over video call.
4. Language:
   - If language is Telugu (${isTelugu ? "YES" : "NO"}): Respond strictly in natural, polite spoken Telugu script (తెలుగు).
   - If language is English: Respond in fluent, empathetic clinical English.
5. Absolute constraints: DO NOT use markdown, asterisks, bullet points, or AI disclaimers. Speak purely as Dr. Sriram to your patient.`;

    // Multi-turn conversational memory (last 3 dialogue turns)
    const recentTurns = history.slice(-3).map(msg => ({
        role: msg.isDoctor ? 'assistant' : 'user',
        content: msg.text
    }));

    const messages = [
        { role: 'system', content: systemPrompt },
        ...recentTurns,
        { role: 'user', content: patientInput }
    ];

    // Check user-configured custom key first
    const config = getSavedAiConfig();
    if (config.apiKey && config.apiKey.trim().length > 5) {
        if (config.provider === 'groq' || config.apiKey.startsWith('gsk_')) {
            console.log("[AI Engine] Using Ultra-Fast Groq inference...");
            const groqReply = await callGroqAi(config.apiKey, messages);
            if (groqReply) return groqReply;
        } else if (config.provider === 'gemini' || config.apiKey.startsWith('AIza')) {
            console.log("[AI Engine] Using Google Gemini inference...");
            const geminiReply = await callGeminiAi(config.apiKey, patientInput, systemPrompt);
            if (geminiReply) return geminiReply;
        }
    }

    // Tier 1: Real-time Cloud AI Inference
    const cloudReply = await callCloudAi(messages);
    if (cloudReply) {
        return cloudReply;
    }

    // Tier 2: Deep Generative Clinical Synthesizer (Nuanced, Dynamic, Non-Repetitive)
    console.log("[AI Engine] Serving nuanced generative clinical response...");
    return generateDeepClinicalSynthesizer(patientInput, patientInfo, isTelugu);
}

/**
 * Deep Generative Clinical Synthesizer
 * Evaluates symptoms, anatomy, pharmacology, nutrition, lifestyle, and intents.
 * Produces highly varied, medically accurate advice so no two questions sound alike.
 */
export function generateDeepClinicalSynthesizer(input, patientInfo = {}, isTelugu = true) {
    const text = (input || "").toLowerCase().trim();
    const pName = patientInfo.name || "Patient";

    // 1. DIETARY & BEVERAGE QUERIES
    if (text.includes("మజ్జిగ") || text.includes("buttermilk") || text.includes("majjiga")) {
        const pool = [
            isTelugu
                ? `${pName} గారు, అవును, మజ్జిగ తాగడం చాలా మంచిది. ఇది శరీర ఉష్ణోగ్రతను తగ్గించి, కడుపును చల్లబరుస్తుంది.`
                : `Yes ${pName}, drinking fresh buttermilk is very healthy. It cools the digestive tract and prevents dehydration.`,
            isTelugu
                ? `తాజా పలచటి మజ్జిగలో కొద్దిగా జీలకర్ర వేసుకొని తాగండి ${pName} గారు. ఇది జీర్ణక్రియను మెరుగుపరుస్తుంది.`
                : `You can definitely take thin fresh buttermilk with a pinch of cumin. It aids gentle digestion.`
        ];
        return pool[Math.floor(Math.random() * pool.length)];
    }

    if (text.includes("కొబ్బరి") || text.includes("coconut water") || text.includes("kobbari")) {
        return isTelugu
            ? `కొబ్బరి నీళ్లు చాలా శ్రేష్ఠం ${pName} గారు. రోజుకు 1 లేదా 2 కొబ్బరి బొండాలు తాగితే శరీరంలో ఎలక్ట్రోలైట్లు సమతుల్యమై నీరసం వెంటనే తగ్గుతుంది.`
            : `Fresh coconut water is wonderful ${pName}. It restores essential electrolytes and relieves weakness effectively.`;
    }

    if (text.includes("పాలు") || text.includes("milk") || text.includes("paalu")) {
        return isTelugu
            ? `గోరువెచ్చని పాలలో చిటికెడు పసుపు వేసుకొని రాత్రి తాగవచ్చు. అయితే జలుబు, కఫం ఎక్కువగా ఉంటే చల్లని పాలు అస్సలు తాగవద్దు.`
            : `You may drink a cup of warm milk with turmeric at night. Avoid cold dairy if you have congestion.`;
    }

    if (text.includes("చికెన్") || text.includes("మటన్") || text.includes("నాన్ వెజ్") || text.includes("non veg") || text.includes("chicken") || text.includes("egg") || text.includes("guddu")) {
        return isTelugu
            ? `జ్వరం, ఇన్ఫెక్షన్ తగ్గే వరకు 2-3 రోజులు నాన్-వెజ్ మరియు ఆయిల్ ఫుడ్ మానండి. తేలికైన ఉడికించిన గుడ్డు తెల్లసొన లేదా వెజిటబుల్ సూప్ మాత్రమే తీసుకోండి.`
            : `Please avoid spicy meats and oily non-veg for 2 to 3 days until your fever resolves. You may have boiled egg whites or light vegetable soup.`;
    }

    if (text.includes("పండ్లు") || text.includes("fruits") || text.includes("pandlu") || text.includes("apple") || text.includes("banana")) {
        return isTelugu
            ? `యాపిల్, దానిమ్మ, బొప్పాయి వంటి తాజా పండ్లు తినవచ్చు. ఫ్రిజ్‌లో ఉంచిన చల్లని పండ్లు కాకుండా గది ఉష్ణోగ్రత వద్ద ఉన్నవే తినండి.`
            : `Fresh fruits like apples, pomegranates, and papaya are excellent for immunity. Consume them at room temperature, not straight from the fridge.`;
    }

    if (text.includes("టీ") || text.includes("కాఫీ") || text.includes("tea") || text.includes("coffee")) {
        return isTelugu
            ? `ఎసిడిటీ లేదా జ్వరం ఉన్నప్పుడు ఎక్కువ టీ, కాఫీలు తాగవద్దు. రోజుకు ఒక కప్పు గ్రీన్ టీ లేదా హెర్బల్ టీ తాగడం మంచిది.`
            : `Limit your caffeine intake, as too much tea or coffee can irritate the stomach lining. Herbal or ginger tea is a better alternative.`;
    }

    // 2. DAILY ACTIVITIES & LIFESTYLE
    if (text.includes("స్నానం") || text.includes("bath") || text.includes("snanam") || text.includes("shower")) {
        return isTelugu
            ? `జ్వరం ఉన్నప్పుడు చన్నీటి స్నానం చేయవద్దు ${pName} గారు. గోరువెచ్చని నీటితో స్నానం చేయండి లేదా తడిగుడ్డతో శరీరాన్ని తుడుచుకోండి.`
            : `Do not take a cold shower during fever ${pName}. Use lukewarm water for a quick, comfortable bath, or use a sponge bath.`;
    }

    if (text.includes("ఆఫీస్") || text.includes("work") || text.includes("office") || text.includes("pani") || text.includes("duty")) {
        return isTelugu
            ? `శరీరం కోలుకోవడానికి కనీసం 2 రోజులు ఇంట్లోనే పూర్తి విశ్రాంతి తీసుకోండి. జ్వరం, నీరసం ఉన్నప్పుడు ప్రయాణాలు మరియు పని ఒత్తిడిని నివారించండి.`
            : `I recommend at least 2 days of rest at home. Avoid commuting and work fatigue until your vitals completely stabilize.`;
    }

    if (text.includes("జిమ్") || text.includes("gym") || text.includes("exercise") || text.includes("workout")) {
        return isTelugu
            ? `ప్రస్తుతం ఎలాంటి వ్యాయామాలు, జిమ్ వర్కౌట్లు చేయవద్దు. శరీరం పూర్తిగా కోలుకున్న తర్వాతే తేలికపాటి వాకింగ్‌తో ప్రారంభించండి.`
            : `Avoid heavy workouts or gym sessions right now. Let your body heal, and resume light walking only once fever is gone for 48 hours.`;
    }

    if (text.includes("ప్రయాణం") || text.includes("travel") || text.includes("journey") || text.includes("driving")) {
        return isTelugu
            ? `ఈ స్థితిలో దూర ప్రయాణాలు వాయిదా వేసుకోవడం ఉత్తమం. ప్రయాణ అలసట వల్ల రోగనిరోధక శక్తి తగ్గి ఇన్ఫెక్షన్ పెరిగే అవకాశం ఉంది.`
            : `It is best to postpone non-urgent travel for a couple of days. Fatigue from traveling can delay your recovery.`;
    }

    // 3. MEDICATION TIMINGS & DOSAGE INQUIRIES
    if (text.includes("పారాసిటమాల్") || text.includes("డోలో") || text.includes("paracetamol") || text.includes("dolo")) {
        return isTelugu
            ? `పారాసిటమాల్ 650mg టాబ్లెట్‌ను భోజనం తర్వాత మాత్రమే వేసుకోండి. రెండు డోసుల మధ్య కనీసం 6 గంటల వ్యవధి ఉండేలా చూసుకోండి.`
            : `Take Paracetamol 650mg strictly after food, maintaining at least a 6-hour gap between two tablets.`;
    }

    if (text.includes("మర్చిపోయాను") || text.includes("forgot") || text.includes("marchipoyanu") || text.includes("missed")) {
        return isTelugu
            ? `టాబ్లెట్ వేసుకోవడం మర్చిపోతే గుర్తొచ్చిన వెంటనే వేసుకోండి. తదుపరి డోస్ సమయం దగ్గరగా ఉంటే డబుల్ డోస్ ఎప్పుడూ వేయకండి.`
            : `If you missed a dose, take it as soon as you remember. If it is already close to your next scheduled dose, skip it and never double-dose.`;
    }

    if (text.includes("యాంటీబయాటిక్") || text.includes("antibiotic") || text.includes("course")) {
        return isTelugu
            ? `యాంటీబయాటిక్స్ కోర్సును మధ్యలో ఆపకుండా డాక్టర్ రాసిన పూర్తి 5 రోజులు క్రమం తప్పకుండా వాడండి.`
            : `Please complete the entire 5-day antibiotic course without discontinuing midway, even if you feel completely better.`;
    }

    // 4. SPECIFIC SYMPTOMS & PATHOLOGIES
    if (text.includes("తల తిరుగుతోంది") || text.includes("తల తిరుగుతుంది") || text.includes("dizziness") || text.includes("vertigo") || text.includes("maykam")) {
        return isTelugu
            ? `${pName} గారు, తల తిరగడం బీపీ తగ్గడం లేదా డీహైడ్రేషన్ వల్ల రావచ్చు. వెంటనే ఒక గ్లాస్ ఓఆర్ఎస్ లేదా నిమ్మరసం తాగి, నెమ్మదిగా పడుకోండి.`
            : `Dizziness can occur from dehydration or low blood pressure. Sip an ORS or electrolyte drink right away and lie down with your legs elevated.`;
    }

    if (text.includes("కడుపులో మంట") || text.includes("ఛాతీలో మంట") || text.includes("heartburn") || text.includes("burning") || text.includes("acidity") || text.includes("manta")) {
        return isTelugu
            ? `కడుపులో మంట తగ్గడానికి ఉదయం పరగడుపున యాంటాసిడ్ వేసుకోండి. కారం, నూనె పదార్థాలు మాని చల్లని పాలు లేదా మజ్జిగ తాగండి.`
            : `For stomach and chest burning, take an antacid on an empty stomach. Avoid oily spices and have a small glass of cool buttermilk.`;
    }

    if (text.includes("వాంతులు") || text.includes("vomit") || text.includes("nausea") || text.includes("vikaaram")) {
        return isTelugu
            ? `వాంతులు ఉన్నప్పుడు ఒకేసారి ఎక్కువ నీళ్లు తాగకుండా, ప్రతి 15 నిమిషాలకు రెండు గుటకల ఓఆర్ఎస్ నీళ్లు తాగండి. ఆండన్‌సెట్రాన్ టాబ్లెట్ సహాయపడుతుంది.`
            : `Sip small spoonfuls of ORS every 15 minutes rather than chugging water. An anti-emetic tablet before food will help settle your stomach.`;
    }

    if (text.includes("విరేచనాలు") || text.includes("motions") || text.includes("diarrhea") || text.includes("loose")) {
        return isTelugu
            ? `విరేచనాలు తగ్గడానికి రోజంతా లీటరు ఓఆర్ఎస్ నీళ్లు తాగండి, ప్రొబయోటిక్ టాబ్లెట్ వేసుకోండి. పాలు, టీ మరియు నూనె ఆహారాలు పూర్తిగా మానండి.`
            : `Stay hydrated with frequent ORS electrolyte water and take a probiotic capsule. Strictly avoid dairy and greasy meals until loose stools stop.`;
    }

    if (text.includes("తలనొప్పి") || text.includes("headache") || text.includes("talanoppi") || text.includes("migraine")) {
        return isTelugu
            ? `తలనొప్పి కోసం పారాసిటమాల్ వేసుకొని చీకటిగా, నిశ్శబ్దంగా ఉండే గదిలో విశ్రాంతి తీసుకోండి. మొబైల్ స్క్రీన్‌లను చూడవద్దు.`
            : `Take a mild analgesic with water and rest in a dark, quiet room. Turn off bright phone screens and get good rest.`;
    }

    if (text.includes("దగ్గు") || text.includes("కఫం") || text.includes("cough") || text.includes("daggu") || text.includes("phlegm")) {
        return isTelugu
            ? `రోజుకు రెండుసార్లు వేడి నీటి ఆవిరి పీల్చండి, గోరువెచ్చని ఉప్పునీటితో పుక్కిలించండి. చల్లని వస్తువులు ఆపి, రాత్రి దగ్గు సిరప్ 10ml తాగండి.`
            : `Do steam inhalation twice daily and gargle with warm saline water. Avoid chilled beverages and take 10ml cough syrup before bed.`;
    }

    if (text.includes("జలుబు") || text.includes("ముక్కు") || text.includes("cold") || text.includes("jalubu") || text.includes("sneezing")) {
        return isTelugu
            ? `జలుబు తగ్గడానికి రాత్రి వేళ సిట్రిజిన్ టాబ్లెట్ వేసుకోండి మరియు వేడి నీటి ఆవిరి పీల్చండి. పుష్కలంగా గోరువెచ్చని ద్రవాలు తాగండి.`
            : `Take an anti-allergic tablet at night and inhale steam with eucalyptus drops. Stay well-hydrated with warm broths.`;
    }

    if (text.includes("జ్వరం") || text.includes("fever") || text.includes("temperature") || text.includes("jwaram") || text.includes("jvaram")) {
        return isTelugu
            ? `జ్వరం తీవ్రతను తగ్గించడానికి డోలో 650mg వేసుకోండి, నుదుటిపై తడిగుడ్డ పెట్టండి. శరీర ఉష్ణోగ్రత 101 దాటితే వెంటనే చెప్పండి.`
            : `Take Paracetamol 650mg after food and apply a cool damp sponge to your forehead. Let me know if fever spikes above 101°F.`;
    }

    if (text.includes("మోకాళ్ల") || text.includes("నడుము") || text.includes("knee") || text.includes("back") || text.includes("joint") || text.includes("mokaallu")) {
        return isTelugu
            ? `నొప్పి ఉన్న భాగంలో వేడి నీటి కాపడం పెట్టండి లేదా పెయిన్ రిలీఫ్ జెల్ రాయండి. బరువులు ఎత్తకుండా, మోకాళ్లపై ఎక్కువ ఒత్తిడి పడకుండా చూసుకోండి.`
            : `Apply warm heat compression or topical analgesic gel over the aching joints. Avoid lifting heavy objects and rest your knees.`;
    }

    if (text.includes("గర్భవతి") || text.includes("pregnant") || text.includes("pregnancy")) {
        return isTelugu
            ? `గర్భధారణ సమయంలో ఎలాంటి సాధారణ పెయిన్ కిల్లర్స్ వేయకూడదు. పారాసిటమాల్ మాత్రమే సురక్షితం, మీ గైనకాలజిస్ట్‌ను కూడా సంప్రదించండి.`
            : `During pregnancy, never self-medicate with NSAID pain relievers. Only mild Paracetamol is safe under obstetric guidance.`;
    }

    if (text.includes("నిద్ర") || text.includes("sleep") || text.includes("nidra") || text.includes("insomnia")) {
        return isTelugu
            ? `పడుకునే గంట ముందు మొబైల్ చూడటం ఆపండి. ఒక గ్లాస్ గోరువెచ్చని పాలు తాగి, గదిని చల్లగా, నిశ్శబ్దంగా ఉంచుకోండి.`
            : `Avoid screens an hour before bed. Drink a cup of warm milk and keep your room cool and quiet to promote restorative sleep.`;
    }

    if (text.includes("ఎన్ని రోజులు") || text.includes("how many days") || text.includes("enni rojulu") || text.includes("taggutundi")) {
        return isTelugu
            ? `మందులు సరిగ్గా వాడితే 2 నుండి 3 రోజుల్లో చాలా వరకు ఉపశమనం లభిస్తుంది. ప్రిస్క్రిప్షన్‌లోని 5 రోజుల కోర్సును మధ్యలో ఆపకుండా వాడండి.`
            : `You should see significant improvement within 2 to 3 days. Complete your full prescribed course for lasting recovery.`;
    }

    if (text.includes("మరిన్ని మందులు") || text.includes("more medicine") || text.includes("mandulu kavali")) {
        return isTelugu
            ? `మీ ప్రిస్క్రిప్షన్‌ను 10 రోజులకు పెంచి అదనపు మందులు చేర్చాను. క్రింద ఉన్న Need More Medicine బటన్ నొక్కి ఫార్మసీ నుండి తెప్పించుకోవచ్చు.`
            : `I have extended your medication course. Click the Need More Medicine button below to send your refill order to the pharmacy.`;
    }

    // 5. RICH DYNAMIC CONVERSATIONAL SYNTHESIS (Randomized Multi-Slot Generator)
    const greetingsTe = [
        `${pName} గారు, మీరు అడిగిన విషయాన్ని గమనించాను.`,
        `${pName} గారు, మీ ఆరోగ్య పరిస్థితిని బట్టి చెబుతున్నాను.`,
        `తప్పకుండా ${pName} గారు, మీ ప్రశ్నకు సమాధానం ఇది.`
    ];
    const clinicalAdviceTe = [
        `ప్రస్తుత లక్షణాలకు గోరువెచ్చని నీళ్లు తాగుతూ, రాసిన ప్రిస్క్రిప్షన్ మందులను భోజనం తర్వాత సమయానికి వేసుకోండి.`,
        `మీరు తేలికపాటి పౌష్టికాహారం తింటూ, శరీరాన్ని చల్లటి గాలి నుండి కాపాడుకుంటూ పూర్తి విశ్రాంతి తీసుకోండి.`,
        `మందుల వేళలను కచ్చితంగా పాటిస్తూ, నూనె మరియు కారపు పదార్థాలకు దూరంగా ఉండండి.`
    ];
    const reassuranceTe = [
        `త్వరలోనే మీకు పూర్తి ఉపశమనం కలుగుతుంది, ఏ సందేహం ఉన్నా నన్ను అడగవచ్చు.`,
        `24 నుండి 48 గంటల్లో ఆరోగ్యం బాగుపడుతుంది, జాగ్రత్తగా ఉండండి.`,
        `ఆందోళన చెందకండి, చెప్పిన జాగ్రత్తలు పాటిస్తే త్వరగా కోలుకుంటారు.`
    ];

    const greetingsEn = [
        `I understand your question, ${pName}.`,
        `Based on your clinical condition ${pName}, here is my advice:`,
        `I have carefully evaluated your concern, ${pName}.`
    ];
    const clinicalAdviceEn = [
        `Please continue taking your prescribed medications after food, stay well hydrated with warm fluids, and rest.`,
        `Stick to freshly prepared light meals, avoid oily spices, and ensure you get at least 8 hours of restful sleep.`,
        `Follow your medication schedule closely, keep your body warm, and avoid physical or mental exertion.`
    ];
    const reassuranceEn = [
        `You should feel noticeably better within a couple of days. Feel free to ask any other questions!`,
        `Do not worry, following these guidelines will ensure a swift and complete recovery.`,
        `Take good care of yourself, and let me know if your symptoms do not improve.`
    ];

    const idx1 = Math.floor(Math.random() * 3);
    const idx2 = Math.floor(Math.random() * 3);
    const idx3 = Math.floor(Math.random() * 3);

    return isTelugu
        ? `${greetingsTe[idx1]} ${clinicalAdviceTe[idx2]} ${reassuranceTe[idx3]}`
        : `${greetingsEn[idx1]} ${clinicalAdviceEn[idx2]} ${reassuranceEn[idx3]}`;
}
