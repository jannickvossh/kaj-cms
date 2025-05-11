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

export function getDateTimeStamp() {
    const date = new Date();

    return date
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