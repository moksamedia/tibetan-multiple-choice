import jsEWTS from "./jsewts";
import sounds from '../assets/sounds.json'
import {SoundFile, SoundVersionGroup, SoundGroup} from '../library/sound-classes'

export const rawJson = sounds

export function replaceWylieInString(string) {
    console.log("replaceWylieInString:" + string)
    const match = string.match(/({([^{]*)})/);
    if (match) {
        const [full, withBrackets, wylie] = match;
        console.log(match)
        const unicode = jsEWTS.fromWylie(wylie)
        const newString = string.replace(full, unicode)
        console.log("replaceWylieInString: " + newString)
        return replaceWylieInString(newString)
    }
    else return string
}

export function getSpeakerFromFilePath(path) {
    const match = path.match(/\/?(.*)\//);
    const [full, speaker] = match;
    return speaker ? speaker : null
}

export function processWylie(json) {
    console.log(json)
    let newJson = json
    json.forEach( (soundGroup, index) => {
        json[index].name = replaceWylieInString(soundGroup.name)
        soundGroup.versionGroups.forEach((vg, j) => {
            json[index].versionGroups[j].name = replaceWylieInString(vg.name)
            vg.files.forEach((file, k) => {
                json[index].versionGroups[j].files[k] = replaceWylieInString(file)
            })
        })
    })
    return newJson
}

async function loadAudioBuffer(path, audioContext) {
    const fullPath = "/sounds/" + path
    try {
        console.log("Loading " + fullPath)
        const response = await fetch(fullPath);
        console.log(response)
        const arrayBuffer = await response.arrayBuffer();
        const buffer =  await audioContext.decodeAudioData(arrayBuffer);
        console.log(buffer)
        return buffer;
    } 
    catch (error) {
      console.error(`Error loading audio file ${fullPath}:`, error);
      throw error;
    }
}

export async function buildSoundGroups(json, audioContext) {
    let soundGroups =
    await Promise.all(json.map(async (sg) => {
        const soundGroupObj = new SoundGroup(sg.name)
        await Promise.all(sg.versionGroups.map(async (vg) => {
            await Promise.all(vg.files.map(async (file) => {
                const speaker = getSpeakerFromFilePath(file)
                const buffer = audioContext != null ? await loadAudioBuffer(file, audioContext) : null
                if (buffer == null) throw Error("Null buffer")
                soundGroupObj.pushSoundFile(vg.name,file,speaker,buffer);
            }));
        }));
        return soundGroupObj;
    }));
    console.log(soundGroups)
    return soundGroups;
}

export async function getSoundGroups(audioContext) {
    const processedJson = processWylie(sounds)
    return await buildSoundGroups(processedJson, audioContext)
}