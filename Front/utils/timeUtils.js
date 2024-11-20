export const getFullHourTimes = () => {
    const currentHour = new Date().getHours();
    const times = [];

    for (let i = -2; i <= 1; i++) {
        const hour = (currentHour + i) % 24;
        times.push(hour + "시");
    }

    return times;
};
