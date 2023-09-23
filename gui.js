const blessed = require('neo-blessed');
const fileWorker = require('./fileWorker');

let screen;


const init = async ()=>{
	screen = blessed.screen({
		smartCSR: true,
		mouse:false
	});

	screen.title = 'Core Dump Viewer';

	// Create a box perfectly centered horizontally and vertically.
	const box = blessed.box({
		top: 0,
		left: 0,
		width: '100%',
		height: '100%',
		scrollable:true,
		mouse:false,
		border: {
			type: 'line'
		},
		style: {
			selected:{
				fg:'green',
				bg:'black'
			},
			fg: 'white',
			bg: 'black',
			border: {
				fg: '#f0f0f0'
			}
		}
	});
	const versionList = initVersionList(box);
	screen.append(box);
	screen.key(['q', 'C-c'], async function(ch, key) {
		await fileWorker.exit();
		return process.exit(0);
	});
	versionList.focus();
	screen.render();

}

const initVersionList = box=>{
	const versions = fileWorker.getVersions();
	const versionList = blessed.list({
		parent:box,
		top: "1%",
		left: "1%",
		width: '97%',
		height: '97%',
		scrollable:true,
		interactive:true,
		keys:true,
		vi:true,
		content: 'Core Dump Viewer',
		items: versions.map(version=>version.directoryName + ` | (${version.coreCount} core${version.coreCount!==1?'s':''})` ),
		border: {
			type: 'line'
		},
		style: {
			selected:{
				fg:'green',
				bg:'black'
			},
			fg: 'white',
			bg: 'black',
			border: {
				fg: '#f0f0f0'
			}
		}
	});
	versionList.on('select',item=>{
		const versionData = versions.find(version=>version.directoryName === item.content.split('|')[0].trim());
		//box.remove(versionList);
		const coreList = initCoreList(box, versionData);
		versionList.detach();
		versionList.destroy();
		screen.render();
		coreList.focus();
	});
	return versionList;
}

const initCoreList = (box, version)=>{
	const cores = fileWorker.getCoreData(version);
	const infoBox = blessed.box({
		parent:box,
		top: '3%',
		left: 0,
		width: '98%',
		height: '70%',
		scrollable:true,
		content: 'Select a corefile for info...',
		border: {
			type: 'line'
		},
		style: {
			selected:{
				fg:'green',
				bg:'black'
			},
			fg: 'white',
			bg: 'black',
			border: {
				fg: '#f0f0f0'
			}
		}
	});
	let gdb;

	const coreList = blessed.list({
		parent:box,
		top: '71%',
		left: 0,
		width: '98%',
		height: '29%',
		scrollable:true,
		interactive:true,
		keys:true,
		vi:true,
		content: 'Core Dump Viewer',
		items: cores.map(core=>core.core),
		border: {
			type: 'line'
		},
		style: {
			selected:{
				fg:'green',
				bg:'black'
			},
			fg: 'white',
			bg: 'black',
			border: {
				fg: '#f0f0f0'
			}
		}
	});
	coreList.on('select',item=>{
		let coreName = item.content;
		coreName += '\n' + cores.find(core=>core.core === coreName).backtrace;
		infoBox.setContent(coreName);
		screen.render();
	});
	coreList.key('r',()=>{
		const input = blessed.form({
			parent:box,
			top:'center',
			left:'center',
			width:'20%',
			height:6,
			text:'Rename Core',
			bg: 'black',
			keys:true,
			autoNext:true
		});
		const textbox = blessed.textbox({
			parent:input,
			top:'center',
			left:'center',
			height:1,
			keys:true,
			inputOnFocus: true,
			vi:false,
			text:'test value',
			bg:'green',
			fg:'black'
		});
		//textbox.setValue();
		textbox.on('submit',submission=>{
			if(submission){
				const toRename = coreList.getItem(coreList.selected).content
				cores.find(cores=>cores.core===toRename).core = submission;
				fileWorker.renameCore(toRename, version, submission);
				coreList.setItem(coreList.selected,submission);
			}
			input.detach();
			screen.render();
			setTimeout(()=>{coreList.focus()});
		});
		textbox.focus();
		screen.render();
		//console.log(coreList);
	});
	let choppingBlock;
	coreList.key('d',()=>{
		const target = coreList.getItem(coreList.selected).content
		if(target === choppingBlock){
			coreList.removeItem(coreList.selected);
			screen.render();
			fileWorker.deleteCore(target, version);
		} else
			choppingBlock = target;
	});
	coreList.key('v',async ()=>{
		const target = coreList.getItem(coreList.selected).content
		screen.spawn('/app/gdblaunch.sh',fileWorker.getGdbArgs(target,version),{cwd:`/cores/${version.directoryName}/dnh`});
		//screen.render();
		/*infoBox.setContent('');
		if(gdb){
			gdb.detach();
			gdb.destroy();
		}
		gdb = blessed.terminal({
			parent:infoBox,
			top:0,
			left:0,
			width:'95%',
			height:'70%',
			shell:'gdb',
			args: fileWorker.getGdbArgs(target)
		});*/
	});
	//coreList.focus();
	return coreList;
}
module.exports = {
	init
}

//init();
