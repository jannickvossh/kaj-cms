export function getCurrentDate() {
    const date = new Date();

    const options = {
        day: "numeric",
        month: "long",
        year: "numeric"
    }

    const currentDate = new Intl.DateTimeFormat("da", options).format(date);
    return currentDate;
}

export function getCurrentTime() {
    const date = new Date();

    const options = {
        hour: "numeric",
        minute: "numeric"
    }

    const currentTime = new Intl.DateTimeFormat("da", options).format(date);
    return currentTime;
}

export function getCurrentDateTime() {
    const currentDate = getCurrentDate();
    const currentTime = getCurrentTime();

    return `${currentDate} ${currentTime}`;
}

export function dailyAdvice() {
    let advice;
    const day = new Date();
    const options = { weekday: "long" };
    const dayOfWeek = new Intl.DateTimeFormat("da", options).format(day);

    switch (dayOfWeek) {
        case "mandag":
            advice = "Ugen er lige startet, så giv los med ny energi!";
            break;
        case "tirsdag":
            advice = "Tirsdagen er over os, og ugen er stadig ung!";
            break;
        case "onsdag":
            advice = "Midten af arbejdsugen ofte gå begge veje.";
            break;
        case "torsdag":
            advice = "Så er det lillefredag!";
            break;
        case "fredag":
            advice = "Sidste arbejdsdag inden fyraften!";
            break;
        case "lørdag":
            advice = "Så er det bare at nyde den bedste dag på ugen!";
            break;
        case "søndag":
            advice = "Uha, en ny uge truer fra i morgen!";
            break;
        default:
            advice = "Du har fået fat i en ikke-eksisterende ugedag. Vildt nok alligevel."
            break;
    }

    return advice;
}

// Følgende funktion er tyvstjålet herfra: https://dev.to/bybydev/how-to-slugify-a-string-in-javascript-4o9n
export function slugify(str) {
    str = str.replace(/^\s+|\s+$/g, ''); // trim leading/trailing white space
    str = str.toLowerCase(); // convert string to lowercase
    str = str.replace(/[^a-z0-9 -]/g, '') // remove any non-alphanumeric characters
             .replace(/\s+/g, '-') // replace spaces with hyphens
             .replace(/-+/g, '-'); // remove consecutive hyphens
    return str;
}

// Følgende funktion er tyvstjålet herfra: https://stackoverflow.com/a/48031564
export function generateAuthToken(n) {
    let chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let token = '';

    for (let i = 0; i < n; i++) {
        token += chars[Math.floor(Math.random() * chars.length)];
    }

    return token;
}