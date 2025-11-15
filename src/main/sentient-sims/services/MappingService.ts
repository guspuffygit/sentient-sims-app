import log from 'electron-log';
import { XMLParser } from 'fast-xml-parser';
import fs from 'fs';
import path from 'path';
import { moodDescriptions, MoodMapping } from '../descriptions/moodDescriptions';
import { traitDescriptions, TraitMapping } from '../descriptions/traitDescriptions';
import { toTraitType } from '../models/TraitType';

export type Instance = {
  class: string;
  stringId: string;
  name: string;
  module: string;
  type: string;
  trait_type?: string;
  xml: string;
};
type EAttribute = {
  '#text'?: string;
  '$a_n'?: string;
};

export type InstanceXML = {
  $a_c?: string;
  $a_i?: string;
  $a_m?: string;
  $a_n?: string;
  $a_s?: string;
  V: any;
  T?: any[];
  E?: EAttribute[];
};

export function toInstance(instanceXML: InstanceXML, xml: string): Instance {
  let traitType = 'NONE';
  if (instanceXML?.E) {
    log.debug(`OUTPUT: ${JSON.stringify(instanceXML, null, 2)}`);
    instanceXML?.E?.forEach((attribute) => {
      if (attribute?.$a_n === 'trait_type' && attribute?.['#text']) {
        traitType = attribute?.['#text'];
      }
    });
  }

  return {
    class: instanceXML.$a_c || '',
    stringId: instanceXML.$a_s || '',
    name: instanceXML.$a_n || '',
    module: instanceXML.$a_m || '',
    type: instanceXML.$a_i || '',
    trait_type: traitType,
    xml,
  };
}

export function getXmlFilesSync(dir: string, fileList: string[] = []) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      getXmlFilesSync(filePath, fileList);
    } else if (path.extname(file).toLowerCase() === '.xml') {
      fileList.push(filePath);
    }
  });

  return fileList;
}

export const xmlParser = new XMLParser({
  ignoreAttributes: false,
  numberParseOptions: {
    hex: false,
    leadingZeros: true,
  },
  attributeNamePrefix: '$a_',
  allowBooleanAttributes: true,
  commentPropName: '#comment',
  isArray: (name, jpath) => {
    if (jpath === 'I.E') return true;
    return false;
  },
});

const textProperties: Record<string, string> = {
  display_name: '',
  display_name_gender_neutral: '',
  trait_origin_description: '',
  trait_description: '',
};

type TraitsParameters = {
  searchClass?: string;
  extractedPath: string;
};

export type ExportTraitsRequest = {
  extractedPath: string;
  traits: Record<string, TraitMapping>;
  variableName?: string;
  modDescription?: string;
};

export class MappingService {
  async getTraits({ searchClass, extractedPath }: TraitsParameters) {
    log.debug(`extracted path: ${extractedPath}`);
    const traitsPath = path.join(extractedPath);
    const stringsPath = path.join(extractedPath, 'strings.json');
    const parsedStrings: any = JSON.parse(fs.readFileSync(stringsPath, 'utf-8'));
    const stringMap: Record<string, string> = {};
    if (parsedStrings?.Entries && Array.isArray(parsedStrings.Entries)) {
      parsedStrings.Entries.forEach((stringPair: any) => {
        if (stringPair?.Key && stringPair?.Value) {
          stringMap[stringPair.Key] = stringPair.Value;
        }
      });
    } else {
      Object.keys(parsedStrings).forEach((key) => {
        stringMap[key] = parsedStrings[key];
      });
    }

    const xmlFiles = getXmlFilesSync(traitsPath, []);

    const instances: Instance[] = [];

    xmlFiles
      .filter((xmlFile) => xmlFile.endsWith('.TraitTuning.xml'))
      .forEach((xmlFile) => {
        let xml = fs.readFileSync(xmlFile, 'utf-8');
        try {
          const result: any = xmlParser.parse(xml);
          if (result?.I) {
            const instanceXml: InstanceXML = result.I;
            if (
              instanceXml?.$a_c &&
              instanceXml?.$a_i === 'trait' &&
              instanceXml?.$a_m &&
              instanceXml?.$a_n &&
              instanceXml?.$a_s
            ) {
              if (Array.isArray(instanceXml?.T)) {
                const newT: any[] = [];
                instanceXml.T.forEach((tInstance) => {
                  if (tInstance?.$a_n in textProperties && '#text' in tInstance && tInstance['#text'] in stringMap) {
                    xml = xml.replace(tInstance['#text'], stringMap[tInstance['#text']]);
                    if ('#text' in tInstance) {
                      tInstance['#text'] = stringMap[tInstance['#text']];
                    }
                  }
                  newT.push(tInstance);
                });
                instanceXml.T = newT;
              }

              const instance = toInstance(instanceXml, xml);

              if (searchClass) {
                if (instance.class === searchClass) {
                  instances.push(instance);
                }
              } else {
                instances.push(instance);
              }
            }
          }
        } catch (err) {
          log.error(`Unable to parse xml file: ${xmlFile}`, err);
          throw err;
        }
      });

    const traits: TraitMapping[] = [];
    const traitsMap: Record<string, TraitMapping> = {};

    instances
      .sort((a, b) => a.name.localeCompare(b.name))
      .forEach((instance) => {
        let ignored: boolean | undefined;
        let description: string | undefined;
        if (instance.name in traitDescriptions) {
          ignored = traitDescriptions[instance.name]?.ignored;
          description = traitDescriptions[instance.name]?.description;
        }
        const traitMapping: TraitMapping = {
          ignored,
          class: instance.class,
          description,
          xml: instance.xml,
          name: instance.name,
          trait_type: toTraitType(instance.trait_type),
        };
        traits.push(traitMapping);
        traitsMap[instance.name] = traitMapping;
      });

    log.debug(`Xml Files Before Adding Some: ${instances.length}`);

    log.debug(`Total returned: ${traits.length}`);

    return {
      data: traits,
    };
  }

  async getUnmappedTraits(traitsParameters: TraitsParameters) {
    const result = await this.getTraits(traitsParameters);
    const unmappedTraits = result.data.filter((mood) => !mood.description);
    log.debug(`Unmapped ${unmappedTraits.length}/${result.data.length}`);
    return {
      data: unmappedTraits,
    };
  }

  async getMoods() {
    const moodsPath = '';
    const xmlFiles = getXmlFilesSync(moodsPath, []);

    const instances: Instance[] = [];

    xmlFiles.forEach((xmlFile) => {
      const xml = fs.readFileSync(xmlFile, 'utf-8');
      const result: any = xmlParser.parse(xml);
      if (result?.I) {
        const instanceXml: InstanceXML = result.I;
        if (
          instanceXml?.$a_c &&
          instanceXml?.$a_i === 'mood' &&
          instanceXml?.$a_m &&
          instanceXml?.$a_n &&
          instanceXml?.$a_s
        ) {
          const instance = toInstance(instanceXml, xml);
          instances.push(instance);
        }
      }
    });

    const traits: MoodMapping[] = [];
    const traitsMap: Record<string, MoodMapping> = {};

    instances.forEach((instance) => {
      const traitMapping: MoodMapping = {
        class: instance.class,
        xml: instance.xml,
        name: instance.name,
      };
      if (instance.name in moodDescriptions) {
        traitMapping.ignored = moodDescriptions[instance.name].ignored;
        traitMapping.description = moodDescriptions[instance.name].description;
      }
      traits.push(traitMapping);
      traitsMap[instance.name] = traitMapping;
    });

    log.debug(`There are ${traits.length} moods:\n${JSON.stringify(traitsMap, null, 2)}`);

    return {
      data: traits,
    };
  }

  async getUnmappedMoods() {
    const result = await this.getMoods();
    return {
      data: result.data.filter((mood) => !mood.description),
    };
  }

  async exportTraits({ extractedPath, traits, variableName, modDescription }: ExportTraitsRequest) {
    const exportedPath = path.join(extractedPath, 'extracted.json');

    let theOutput = '';

    if (modDescription) {
      theOutput += `/* ${modDescription} */\n`;
    }

    if (variableName) {
      theOutput += `const ${variableName}: Record<string, TraitMapping> = {\n`;
    } else {
      theOutput += '{\n';
    }

    for (const [key, trait] of Object.entries(traits)) {
      theOutput += `  ${key}: {\n`;
      theOutput += `    name: '${trait.name}',\n`;
      if (trait.ignored !== undefined) {
        theOutput += `    ignored: ${trait.ignored},\n`;
      }
      if (trait.description) {
        const escapedDescription = trait.description.replace(/'/g, "\\'").replace(/\n/g, '\\n');
        theOutput += `    description: '${escapedDescription}',\n`;
      }
      theOutput += `    class: '${trait.class}',\n`;
      theOutput += `    trait_type: TraitType.${trait.trait_type},\n`;
      theOutput += `  },\n`;
    }

    if (variableName) {
      theOutput += '};\n';
    } else {
      theOutput += '}\n';
    }

    fs.writeFileSync(exportedPath, theOutput, 'utf-8');
  }
}
