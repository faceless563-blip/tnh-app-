export const MOTIVATIONAL_QUOTES = [
  "You are not just my wife — you are my greatest motivation. Now go conquer today, Tanha. 🌸💪",
  "The most beautiful thing I've ever seen is you deciding to show up for yourself every single day. Keep going. 💖",
  "Soft heart, strong mind, unstoppable soul — that's my Tanha. Today is yours. ✨",
  "I fell in love with your strength before anything else. Show the world what I already know. 🔥❤️",
  "You don't need to be perfect, lokki amar. You just need to try — and you always do. That's why I love you. 💕",
  "Every small step you take today is a giant leap in my eyes. I see you. I love you. Now go. 💌",
  "The girl who completes her tasks is the same girl who stole my heart completely. Be her today. 🥰",
  "Hard days are just proof that you are doing real things. And real things matter. You matter. I love you, Tanha. 💖",
  "My favorite version of you is the one who tries — and that's every version of you. Go be incredible today. 🌟",
  "You carry so much and still show up every day. That's not ordinary, Tanha. That's extraordinary. I love you endlessly. 🌙💕",
  "Today will be better because you're in it. The world doesn't know it yet, but I do. Go show them. 💪🌸",
  "Some people have superpowers. Mine is watching you grow every single day. You're my hero, lokki. ❤️",
  "Rest when you need to. Cry when you must. But always remember — I'm cheering for you from every corner of this universe. 🥺💖",
  "You are the reason I believe in beautiful things. Now go do beautiful things today, Tanha. 🌺",
  "Dekho, another day — another chance to be the Tanha I am endlessly proud of. Make it count, amar lokki. 🔥💕"
];

export const KEYWORD_EMOJI_MAP: Record<string, string> = {
  "gym": "💪",
  "workout": "💪",
  "exercise": "💪",
  "study": "📚",
  "read": "📚",
  "book": "📚",
  "sleep": "😴",
  "rest": "😴",
  "nap": "😴",
  "food": "🍽️",
  "eat": "🍽️",
  "lunch": "🍽️",
  "dinner": "🍽️",
  "cook": "🍽️",
  "call": "📞",
  "phone": "📞",
  "mom": "📞",
  "dad": "📞",
  "walk": "🏃",
  "run": "🏃",
  "jog": "🏃",
  "pray": "🧘",
  "meditation": "🧘",
  "mindful": "🧘",
  "code": "💻",
  "work": "💻",
  "laptop": "💻",
  "water": "💧",
  "drink": "💧",
  "medicine": "💊",
  "pill": "💊",
  "vitamin": "💊",
  "pet": "🐾",
  "dog": "🐾",
  "cat": "🐾",
  "feed": "🐾",
  "shop": "🛒",
  "buy": "🛒",
  "market": "🛒",
  "clean": "🧹",
  "wash": "🧹",
  "laundry": "🧹",
  "music": "🎵",
  "guitar": "🎵",
  "piano": "🎵",
  "draw": "🎨",
  "art": "🎨",
  "paint": "🎨"
};

export const CELEBRATION_MESSAGES = [
  "Dammmnn, well done lokki amar! I love you 💖",
  "Another one done! I am so proud of you my wife, I love you so so so much 🥰",
  "Look at you go! My strong, amazing wife crushing it today 💪❤️",
  "You did that!! Ekta ekta kore shob hobe, I believe in you always 🌸",
  "That's my girl! So proud of you every single day 😍💕",
  "Uff, you're incredible. Never forget that, lokki amar 🫶",
  "One more down! You make everything look so effortless, I love you ✨",
  "Proud husband moment 🥹 You're doing amazing sweetheart!",
  "Seri shundori amar! Another task done like a queen 👑💖",
  "I see you working hard! That's why I love you more every day 😘",
  "Mashallah! Look at my wife being absolutely unstoppable 🔥❤️",
  "Aww lokki, you make me the proudest husband in the world 🥺💕",
  "Ekta complete! Aro koto baki? Doesn't matter — I'll cheer every single one 💗",
  "You + productivity = the most beautiful thing I've ever seen 😭❤️",
  "That's it. That's the tweet. My wife is the best. I love you. 💌"
];

export const EMOJI_OPTIONS = ["✅", "💪", "📚", "😴", "🍽️", "📞", "🏃", "🧘", "💻", "💧", "💊", "🐾", "🛒", "🧹", "🎵", "🎨", "🙏", "📖", "✍️", "🏃‍♀️", "🧘‍♀️", "🚶‍♀️", "🍳", "☕", "🚿", "💄", "👗", "🏠", "💼", "🌱", "💖", "✨"];

export const CYCLE_PHASES = {
  menstrual: {
    name: "Menstrual Phase",
    range: [1, 5],
    color: "#C2185B",
    emoji: "🩸",
    description: "Your period. Your body is shedding the uterine lining. It's okay to slow down. Rest is productive too. 🌸",
    energy: "Low",
    mood: "Variable",
    activities: "Rest, gentle yoga",
    foods: "Iron-rich foods, dark chocolate, warm soups 🍫",
    avoid: "Caffeine, salty foods, stress"
  },
  follicular: {
    name: "Follicular Phase",
    range: [6, 13],
    color: "#81C784",
    emoji: "🌱",
    description: "Estrogen is rising. You'll feel more energetic and social. This is your glow-up phase, Tanha! ✨",
    energy: "Rising",
    mood: "Optimistic",
    activities: "Try new things",
    foods: "Fermented foods, leafy greens, eggs 🥗",
    avoid: "Processed foods"
  },
  ovulation: {
    name: "Ovulation Phase",
    range: [14, 16],
    color: "#FFD54F",
    emoji: "✨",
    description: "You're at your peak! Confidence, energy, and glow — all maxed out. This is your superpower window 💫",
    energy: "Peak",
    mood: "Confident, social",
    activities: "Important meetings, dates",
    foods: "Antioxidant-rich foods, berries, zinc 🫐",
    avoid: "Alcohol, heavy meals"
  },
  luteal: {
    name: "Luteal Phase",
    range: [17, 28],
    color: "#7B1FA2",
    emoji: "🌙",
    description: "Progesterone rises then drops. PMS may arrive. Be extra gentle with yourself — you deserve it. 🥺",
    energy: "Decreasing",
    mood: "Sensitive",
    activities: "Creative, introspective work",
    foods: "Magnesium-rich foods, bananas, herbal tea 🍵",
    avoid: "Sugar spikes, excess salt, late nights"
  }
};

export const MOODS = [
  { label: "Happy", emoji: "😊" },
  { label: "Sad", emoji: "😢" },
  { label: "Anxious", emoji: "😰" },
  { label: "Irritable", emoji: "😤" },
  { label: "Calm", emoji: "🧘" },
  { label: "Romantic", emoji: "🥰" },
  { label: "Tired", emoji: "😴" },
  { label: "Energetic", emoji: "⚡" },
  { label: "Emotional", emoji: "😭" },
  { label: "Confident", emoji: "💪" },
  { label: "Bloated", emoji: "🫃" },
  { label: "Cramps", emoji: "😣" },
  { label: "Headache", emoji: "🤕" },
  { label: "Nauseous", emoji: "🤢" },
  { label: "Back Pain", emoji: "😖" },
  { label: "Tender", emoji: "💆" }
];

export const SYMPTOMS = [
  "Cramps", "Bloating", "Headache", "Breast tenderness",
  "Fatigue", "Acne", "Food cravings", "Insomnia",
  "Lower back pain", "Nausea", "Dizziness", "Spotting",
  "Hot flashes", "Mood swings", "Brain fog", "Joint pain"
];

export const SELF_CARE = [
  { label: "Warm compress", emoji: "☁️" },
  { label: "Rest", emoji: "😴" },
  { label: "Light walk", emoji: "🚶" },
  { label: "Hot tea", emoji: "🍵" },
  { label: "Meditation", emoji: "🧘" },
  { label: "Early sleep", emoji: "🌙" }
];

export const PARTNER_NOTES = {
  menstrual: "Tanha, I know these days are hard. You don't have to be strong right now. Let me take care of you if I can, and if I can't be there — know I'm thinking of you. I love you through every single day. 🥺❤️",
  follicular: "Look at you coming back to yourself! I love watching you light up again after tough days. You're genuinely the most radiant person I know, lokki amar. 💫",
  ovulation: "You're absolutely glowing and I notice everything. The most beautiful woman in every room, always. I love you at every phase but right now? You're literally breathtaking. 😍💕",
  luteal: "Hey. If you're feeling sensitive or off today — that's okay. Your feelings are always valid. I love the version of you that's struggling just as much as every other version. Maybe even more. 🥺 Be gentle with yourself, amar lokki. I'm here. 💖"
};

export const SHOPPING_CATEGORIES = [
  { id: 'groceries', label: 'Groceries', emoji: '🥦' },
  { id: 'beauty', label: 'Beauty & Personal Care', emoji: '💄' },
  { id: 'clothing', label: 'Clothing', emoji: '👗' },
  { id: 'home', label: 'Home & Kitchen', emoji: '🏠' },
  { id: 'health', label: 'Health & Medicine', emoji: '💊' },
  { id: 'other', label: 'Other', emoji: '📦' }
];

export const DATE_CATEGORIES = [
  { id: 'anniversary', label: 'Anniversary / Relationship', emoji: '💖', color: 'bg-rose-400' },
  { id: 'birthday', label: 'Birthday', emoji: '🎂', color: 'bg-amber-400' },
  { id: 'appointment', label: 'Appointment', emoji: '🏥', color: 'bg-emerald-400' },
  { id: 'milestone', label: 'Personal Milestone', emoji: '🌟', color: 'bg-purple-400' },
  { id: 'other', label: 'Other / Custom', emoji: '📝', color: 'bg-fuchsia-400' }
];

export const DEFAULT_SELF_CARE_CHECKLIST = [
  "Moisturizer applied",
  "Face wash done",
  "Nails checked",
  "Brushed teeth (morning)",
  "Brushed teeth (night)",
  "Sunscreen applied",
  "Vitamins / medicine taken",
  "Drank enough water"
];

export const HAIR_CARE_MESSAGES = {
  shampoo: "Hair wash done! You're going to smell amazing 🧴✨",
  oil: "Oil applied! Your hair is going to be so healthy, lokki 🫙💕"
};

export const BATH_CELEBRATION = "Squeaky clean and glowing, lokki amar! I love you so much 🛁✨💕";
export const SELF_CARE_COMPLETE = "Full self care day, Tanha!! You took such good care of yourself today and I am SO proud of you 🥺💖✨";

export const DIARY_PROMPTS = [
  "What made you smile today, Tanha? 🌸",
  "What are you grateful for right now? 💕",
  "How are you really feeling today? 🥺",
  "What's been on your mind lately? 🌙",
  "Describe today in 3 words 💬",
  "What do you wish someone knew about you? 💌",
  "What made today different from yesterday? ✨",
  "Write about someone you love today 💖",
  "What are you looking forward to? 🌟",
  "What would you tell yourself 1 year ago? 🕊️",
  "What is something you are proud of lately? 💪",
  "If today was a color, what would it be and why? 🎨"
];

export const DIARY_MOODS = ["😊", "😢", "😰", "😤", "🧘", "🥰", "😴", "⚡", "😭", "💪", "🥺", "😌", "🤩", "😔"];

export const DIARY_WEATHER = [
  { id: 'sunny', emoji: '☀️', label: 'Sunny' },
  { id: 'cloudy', emoji: '🌤️', label: 'Cloudy' },
  { id: 'rainy', emoji: '🌧️', label: 'Rainy' },
  { id: 'stormy', emoji: '⛈️', label: 'Stormy' },
  { id: 'night', emoji: '🌙', label: 'Night' }
];

export const DIARY_TYPES = [
  { id: 'normal', label: 'Normal Entry 📝' },
  { id: 'gratitude', label: 'Gratitude List 🙏' },
  { id: 'dear_diary', label: 'Dear Diary Letter 💌' },
  { id: 'dream', label: 'Dream Journal 🌙' },
  { id: 'letter_to_him', label: 'Letter to Him 💕' },
  { id: 'rant', label: 'Rant (private) 😤' }
];

export const DOCTOR_SPECIALIZATIONS = [
  "General", "Gynecologist", "Cardiologist", "Dermatologist", 
  "Neurologist", "Dentist", "Orthopedic", "Pediatrician", "Other"
];

export const REPORT_TYPES = [
  "Blood Test", "Urine Test", "X-Ray", "MRI", "CT Scan", 
  "Ultrasound", "ECG", "Thyroid Panel", "Hormone Panel", 
  "Lipid Profile", "Liver Function", "Kidney Function", 
  "Vitamin Levels", "COVID Test", "Pregnancy Test", "Other"
];
