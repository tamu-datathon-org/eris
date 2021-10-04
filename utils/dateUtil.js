export const TIME_DOMAIN = {
    m: 60 * 1000,
    h: 36 * 100 * 1000,
    d: 864 * 100 * 1000,
};

export const formatDate = async (date) => {
    let hours = date.getHours();
    let minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; 
    minutes = minutes < 10 ? `0${minutes}` : minutes;
    const strTime = `${hours}:${minutes} ${ampm}`;
    return (`${date.getMonth()+1}/${date.getDate()}/${date.getFullYear()}  ${strTime}`);
};

export const msToTimeDomain = async (ms) => {
    return Math.floor(ms / exports.TIME_DOMAIN.d) ?
        `${Math.floor(ms / exports.TIME_DOMAIN.d)} days` : Math.floor(ms / exports.TIME_DOMAIN.h) ?
            `${Math.floor(ms / exports.TIME_DOMAIN.h)} hrs` : Math.floor(ms / exports.TIME_DOMAIN.m) ?
                `${Math.floor(ms / exports.TIME_DOMAIN.m)} mins` : null;
};
