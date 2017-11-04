import chalk from 'chalk';

const addCurrentTimeToMessage = message => {
    const date = new Date();
    
    let hours = date.getHours();
    let minutes = date.getMinutes();
    let seconds = date.getSeconds();
    
    if (hours < 10) {
        hours = '0' + hours;
    }
    if (minutes < 10) {
        minutes = '0' + minutes;
    }
    if (seconds < 10) {
        seconds = '0' + seconds;
    }

    return `[${hours}:${minutes}:${seconds}] ${message}`;
}

export const ERROR = message => console.info(chalk.red(addCurrentTimeToMessage(message)));

export const INFO = message => console.info(chalk.blue(addCurrentTimeToMessage(message)));

export const WARN = message => console.info(chalk.yellow(addCurrentTimeToMessage(message)));

export default {
    ERROR,
    INFO,
    WARN,
};


