export function dailyAdvice() {
    let advice;
    const day = new Date();
    const options = { weekday: "long" };
    let dayOfWeek = new Intl.DateTimeFormat("da", options).format(day);

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