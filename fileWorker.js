
const fs = require('fs');
const {execSync} = require('child_process');

const basePath = '/cores/';
const corePrefix = 'core';
const promises = [];




const getVersions = ()=>{
	const versions = fs.readdirSync(basePath);
	return versions.map(file=>{
		return {
			'directoryName': file,
			'game': file.split('-')[0],
			'coreCount': fs.readdirSync(basePath + file).filter(fileName=>fileName.includes(corePrefix)).length
		}
	});
}

const getCoreData = version=>{
	//console.log('Collecting and processing core dumps...');

	const corePath = basePath + version.directoryName + '/';
	const sourcePath = basePath + version.directoryName + '/dnh';
	const binaryPath = sourcePath + `/${version.game}dir/${version.game}`;

	const cores = fs.readdirSync(corePath).filter(fileName=>fileName.includes(corePrefix));
	//console.log(cores);
	const backtraces = cores.map(core=>{
		return {
			backtrace: execSync(`printf "bt\nquit\n" | gdb -silent ${binaryPath} ${corePath}${core}`,{cwd:sourcePath,stdio:['pipe','pipe','pipe']}).toString(),
			core: core
		};
	});
	return backtraces;
}

const renameCore = (core,version, newName)=>{
	const corePath = basePath + version.directoryName + '/';
	//This is horrible and so open to abuse jesus christ
	promises.push(new Promise((resolve,reject)=>{
		fs.rename(corePath + core, corePath+newName,()=>{
			resolve();
		});
	}));
}
const deleteCore = (core, version)=>{
	const corePath = basePath + version.directoryName + '/';
	promises.push(new Promise((resolve,reject)=>{
		fs.unlink(corePath + core,()=>{
			resolve();
		});
	}));

}

const getGdbArgs = (core, version)=>{
	const corePath = basePath + version.directoryName + '/';
	const sourcePath = basePath + version.directoryName + '/dnh';
	const binaryPath = sourcePath + `/${version.game}dir/${version.game}`;
	return [binaryPath,corePath+core];
}

const exit = async()=>{
	await Promise.all(promises);
}

module.exports = {
	getVersions,
	getCoreData,
	renameCore,
	deleteCore,
	getGdbArgs,
	exit
}
