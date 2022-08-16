
const fs = require('fs');
const {execSync} = require('child_process');
const corePath = '/cores/';
const corePrefix = 'core';
const sourcePath = '/cores/dnh/';
const game = process.env.GAME || 'dnethack';
const binaryPath = sourcePath + `${game}dir/${game}`;
const promises = [];


const getCoreData = ()=>{
	console.log('Collecting and processing core dumps...');

	const cores = fs.readdirSync(corePath).filter(fileName=>fileName.includes('core'));
	console.log(cores);
	const backtraces = cores.map(core=>{
		return {
			backtrace: execSync(`printf "bt\nquit\n" | gdb -silent ${binaryPath} ${corePath}${core}`,{cwd:sourcePath,stdio:['pipe','pipe','pipe']}).toString(),
			core: core
		};
	});
	return backtraces;
}

const renameCore = (core,newName)=>{
	//This is horrible and so open to abuse jesus christ
	promises.push(new Promise((resolve,reject)=>{
		fs.rename(corePath + core, corePath+newName,()=>{
			resolve();
		});
	}));
}
const deleteCore = (core)=>{
	promises.push(new Promise((resolve,reject)=>{
		fs.unlink(corePath + core,()=>{
			resolve();
		});
	}));

}

const getGdbArgs = (core)=>{
	return [binaryPath,corePath+core];
}

const exit = async()=>{
	await Promise.all(promises);
}

module.exports = {
	getCoreData,
	renameCore,
	deleteCore,
	getGdbArgs,
	exit
}
