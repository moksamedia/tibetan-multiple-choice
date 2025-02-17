import { 
    processWylie, 
    replaceWylieInString, 
    buildSoundGroups 
} from "./sound-loader"
import { expect, test } from 'vitest'
import soundstest from '../assets/sounds-test.json'


 
//Recursive implementation of jSON.stringify;
var stringifyJSON = function(obj) {

    var arrOfKeyVals = [],
        arrVals = [],
        objKeys = [];

    /*********CHECK FOR PRIMITIVE TYPES**********/
    if (typeof obj === 'number' || typeof obj === 'boolean' || obj === null)
        return '' + obj;
    else if (typeof obj === 'string')
        return '"' + obj + '"';

    /*********CHECK FOR ARRAY**********/
    else if (Array.isArray(obj)) {
        //check for empty array
        if (obj[0] === undefined)
            return '[]';
        else {
            obj.forEach(function(el) {
                arrVals.push(stringifyJSON(el));
            });
            return '[' + arrVals + ']';
        }
    }
    /*********CHECK FOR OBJECT**********/
    else if (obj instanceof Object) {
        //get object keys
        objKeys = Object.keys(obj);
        //set key output;
        objKeys.forEach(function(key) {
            var keyOut = '"' + key + '":';
            var keyValOut = obj[key];
            //skip functions and undefined properties
            if (keyValOut instanceof Function || typeof keyValOut === undefined)
                arrOfKeyVals.push('');
            else if (typeof keyValOut === 'string')
                arrOfKeyVals.push(keyOut + '"' + keyValOut + '"');
            else if (typeof keyValOut === 'boolean' || typeof keValOut === 'number' || keyValOut === null)
                arrOfKeyVals.push(keyOut + keyValOut);
            //check for nested objects, call recursively until no more objects
            else if (keyValOut instanceof Object) {
                arrOfKeyVals.push(keyOut + stringifyJSON(keyValOut));
            }
        });
        return '{' + arrOfKeyVals + '}';
    }
};

test('Check wylie replacement in JSON', () => {
    expect(replaceWylieInString("རྟོག་པ་ vs ལྡོག་པ་ (verbs) {rtogs pa }")).toBe("རྟོག་པ་ vs ལྡོག་པ་ (verbs) རྟོགས་པ་")
    expect(replaceWylieInString("/khelsang/{rtog pa }_1")).toBe("/khelsang/རྟོག་པ་_1")

    const processedJson = processWylie(soundstest)
    expect(processedJson[0].name).toBe("རྟོག་པ་ vs ལྡོག་པ་ (verbs) རྟོགས་པ་")
    expect(processedJson[0].versionGroups[0].name).toBe("ལྡོག་པ་")
    expect(processedJson[0].versionGroups[1].name).toBe("bob")

    expect(processedJson[0].versionGroups[0].files[0]).toBe("/khelsang/ལྡོག་པ་_1")
    expect(processedJson[0].versionGroups[0].files[1]).toBe("/khelsang/ལྡོག་པ་_2")

    expect(processedJson[0].versionGroups[1].files[0]).toBe("/khelsang/རྟོགས་པ་_1")
    expect(processedJson[0].versionGroups[1].files[1]).toBe("/khelsang/རྟོགས་པ་_2")
})

test('Build sound groups', async () => {
    const processedJson = processWylie(soundstest)
    const result = await buildSoundGroups(processedJson)
    console.log("result", stringifyJSON(result))
})