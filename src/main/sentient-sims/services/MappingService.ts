/* eslint-disable class-methods-use-this */
import log from 'electron-log';
import { XMLParser } from 'fast-xml-parser';
import fs from 'fs';
import path from 'path';
import { moodDescriptions } from '../descriptions/moodDescriptions';
import { attractionPreferenceDescriptions } from '../descriptions/attractionPreferenceDescriptions';
import { TraitMapping } from '../descriptions/traitDescriptions2';
import { allTraits } from '../descriptions/allTraits';

const extractedPath = path.join(process.cwd(), 'extracted');
const traitsPath = path.join(extractedPath, 'Trait');
const moodsPath = path.join(extractedPath, 'Mood');
const stringsPath = path.join(extractedPath, 'strings.json');

export const stringMap: Record<string, string> = JSON.parse(
  fs.readFileSync(stringsPath, 'utf-8')
);

export type Instance = {
  class: string;
  stringId: string;
  name: string;
  module: string;
  type: string;
  trait_type?: string;
  xml: string;
};

export type InstanceXML = {
  $a_c?: string;
  $a_i?: string;
  $a_m?: string;
  $a_n?: string;
  $a_s?: string;
  V: any;
  T?: any[];
  E?: {
    '#text'?: string;
    $a_n?: string;
  };
};

export function toInstance(instanceXML: InstanceXML, xml: string): Instance {
  return {
    class: instanceXML.$a_c || '',
    stringId: instanceXML.$a_s || '',
    name: instanceXML.$a_n || '',
    module: instanceXML.$a_m || '',
    type: instanceXML.$a_i || '',
    trait_type: instanceXML?.E?.['#text'] || '',
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
});

const textProperties: Record<string, string> = {
  display_name: '',
  display_name_gender_neutral: '',
  trait_origin_description: '',
  trait_description: '',
};

export class MappingService {
  async getTraits(searchClass?: string) {
    log.debug(`Strings count: ${Object.keys(stringMap).length}`);

    const xmlFiles = getXmlFilesSync(traitsPath, []);

    const instances: Instance[] = [];

    xmlFiles.forEach((xmlFile) => {
      let xml = fs.readFileSync(xmlFile, 'utf-8');
      const result: any = xmlParser.parse(xml);
      if (result?.I) {
        const instanceXml: InstanceXML = result.I;
        if (
          instanceXml?.$a_c &&
          instanceXml?.$a_i === 'trait' &&
          instanceXml?.$a_m &&
          instanceXml?.$a_n &&
          instanceXml?.$a_s &&
          instanceXml?.E?.$a_n === 'trait_type' &&
          instanceXml?.E?.['#text']
        ) {
          if (Array.isArray(instanceXml?.T)) {
            const newT: any[] = [];
            instanceXml.T.forEach((tInstance) => {
              if (
                tInstance?.$a_n in textProperties &&
                '#text' in tInstance &&
                tInstance['#text'] in stringMap
              ) {
                xml = xml.replace(
                  tInstance['#text'],
                  stringMap[tInstance['#text']]
                );
                if ('#text' in tInstance) {
                  tInstance['#text'] = stringMap[tInstance['#text']];
                }
              }
              newT.push(tInstance);
            });
            instanceXml.T = newT;
            log.debug(JSON.stringify(instanceXml, null, 2));
          }

          const instance = toInstance(instanceXml, xml);

          if (searchClass) {
            if (instance.class === searchClass) {
              instances.push(instance);
            }
          } else {
            log.debug(JSON.stringify(instance, null, 2));
            instances.push(instance);
          }
        }
      }
    });

    const traits: TraitMapping[] = [];
    const traitsMap: Record<string, TraitMapping> = {};

    instances
      .sort((a, b) => a.name.localeCompare(b.name))
      .forEach((instance) => {
        let ignored: boolean | undefined;
        let description: string | undefined;
        if (instance.name in allTraits) {
          ignored = allTraits[instance.name]?.ignored;
          description = allTraits[instance.name]?.description;
        }
        if (instance.name in attractionPreferenceDescriptions) {
          ignored = attractionPreferenceDescriptions[instance.name]?.ignored;
          description =
            attractionPreferenceDescriptions[instance.name]?.description;
        }
        const traitMapping: TraitMapping = {
          ignored,
          class: instance.class,
          description,
          xml: instance.xml,
          name: instance.name,
          trait_type: instance.trait_type,
        };
        traits.push(traitMapping);
        traitsMap[instance.name] = traitMapping;
      });

    if (!searchClass) {
      Object.keys(allTraits).forEach((key) => {
        if (!traitsMap[key]) {
          traits.push(allTraits[key]);
        }
      });
    }

    log.debug(`Total returned: ${traits.length}`);

    return {
      data: traits,
    };
  }

  async getUnmappedTraits() {
    const result = await this.getTraits();
    const unmappedTraits = result.data.filter((mood) => !mood.description);
    log.debug(`Unmapped ${unmappedTraits.length}/${result.data.length}`);
    return {
      data: unmappedTraits,
    };
  }

  async getMoods() {
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

    const traits: TraitMapping[] = [];
    const traitsMap: Record<string, TraitMapping> = {};

    instances.forEach((instance) => {
      const traitMapping: TraitMapping = {
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

    const finalizedMoods: TraitMapping[] = traits.map((mood) => {
      mood.xml = undefined;
      mood.class = undefined;
      return mood;
    });

    finalizedMoods.sort((a, b) => a.name.localeCompare(b.name));

    const finalized: Record<string, TraitMapping> = {};

    finalizedMoods.forEach((mood) => {
      finalized[mood.name] = mood;
    });

    log.debug(
      `There are ${traits.length} moods:\n${JSON.stringify(finalized, null, 2)}`
    );

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
}
