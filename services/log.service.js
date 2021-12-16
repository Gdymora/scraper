import chalk from 'chalk';
import dedent from 'dedent';

function printError(error) {
    console.log(chalk.bgRed(' ERROR ') + ' ' + error)
}
function printSuccess(message) {
    console.log(chalk.bgGreen(' SUCCESS ') + ' ' + message)
}
function printHelp(message) {
    console.log(
        dedent`${chalk.bgCyan(' HELP ')} 
    Без параметров - парсинг установленного ресурса
    -u [URL] для установки url
    -h для вывода помощи
    `);
}

const printParser = (res) => {
	console.log(
		dedent`${chalk.bgYellow(' WEATHER ')} Погода в городе ${res.name}
		${res.weather[0].description}
		Температура: ${res.main.temp} (ощущается как ${res.main.feels_like})
		Влажность: ${res.main.humidity}%
		Скорость ветра: ${res.wind.speed}
		`
	);
};

export { printError, printSuccess, printHelp, printParser };
