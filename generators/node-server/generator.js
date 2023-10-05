import BaseApplicationGenerator from 'generator-jhipster/generators/base-application';
import command from './command.js';
import { serverFiles } from './files.js';
import { entityFiles } from './entity-files.js';

function sanitizeDbType(fieldType, dbType) {
  if (dbType === 'sqlite') {
    if (fieldType === 'timestamp') {
      return 'datetime';
    }
  }
  return fieldType;
}

const fieldTypes = {
  Boolean: 'boolean',
  Integer: 'number',
  Long: 'number',
  Float: 'number',
  Double: 'number',
  BigDecimal: 'number',
  String: 'string',
  UUID: 'string',
};

const dbTypes = {
  Boolean: 'boolean',
  Integer: 'integer',
  Long: 'long',
  Float: 'float',
  Double: 'double',
  BigDecimal: 'decimal',
  LocalDate: 'date',
  Instant: 'timestamp',
  ZonedDateTime: 'datetime',
  AnyBlob: 'blob',
  ImageBlob: 'blob',
  Blob: 'blob',
  TextBlob: 'blob',
  'byte[]': 'blob',
};

export default class extends BaseApplicationGenerator {
  async beforeQueue() {
    await this.dependsOnJHipster('bootstrap-application');
  }

  get [BaseApplicationGenerator.INITIALIZING]() {
    return this.asInitializingTaskGroup({
      async initializingTemplateTask() {
        this.parseJHipsterCommand(command);
      },
    });
  }

  get [BaseApplicationGenerator.PROMPTING]() {
    return this.asPromptingTaskGroup({
      async promptingTemplateTask({ control }) {
        if (control.existingProject && !this.options.askAnswered) return;

        await this.prompt(this.prepareQuestions(command.configs));
      },
    });
  }

  get [BaseApplicationGenerator.CONFIGURING]() {
    return this.asConfiguringTaskGroup({
      async configuringTemplateTask() {
        if (this.jhipsterConfigWithDefaults.prodDatabaseType === 'mongodb') {
          this.jhipsterConfig.databaseType = 'mongodb';
        }
      },
    });
  }

  get [BaseApplicationGenerator.COMPOSING]() {
    return this.asComposingTaskGroup({
      async composingTemplateTask() {
        await this.composeWithJHipster('docker');
      },
    });
  }

  get [BaseApplicationGenerator.LOADING]() {
    return this.asLoadingTaskGroup({
      async loadingTemplateTask({ application }) {
        application.clientRootDir = 'client/';
        application.clientSrcDir = 'client/src/';
        application.clientTestDir = 'client/test/';
        application.clientDistDir = 'client/dist/';
        application.dockerServicesDir = 'docker/';
        application.withAdminUi = false;
        application.temporaryDir = 'tmp/';
      },
    });
  }

  get [BaseApplicationGenerator.PREPARING]() {
    return this.asPreparingTaskGroup({
      async preparingTemplateTask() {},
    });
  }

  get [BaseApplicationGenerator.CONFIGURING_EACH_ENTITY]() {
    return this.asConfiguringEachEntityTaskGroup({
      async configuringEachEntityTemplateTask({ entityConfig }) {
        entityConfig.dto = true;
      },
    });
  }

  get [BaseApplicationGenerator.LOADING_ENTITIES]() {
    return this.asLoadingEntitiesTaskGroup({
      async loadingEntitiesTemplateTask() {},
    });
  }

  get [BaseApplicationGenerator.PREPARING_EACH_ENTITY]() {
    return this.asPreparingEachEntityTaskGroup({
      async preparingEachEntityTemplateTask() {},
    });
  }

  get [BaseApplicationGenerator.PREPARING_EACH_ENTITY_FIELD]() {
    return this.asPreparingEachEntityFieldTaskGroup({
      async preparingEachEntityFieldTemplateTask() {},
    });
  }

  get [BaseApplicationGenerator.PREPARING_EACH_ENTITY_RELATIONSHIP]() {
    return this.asPreparingEachEntityRelationshipTaskGroup({
      async preparingEachEntityRelationshipTemplateTask() {},
    });
  }

  get [BaseApplicationGenerator.POST_PREPARING_EACH_ENTITY]() {
    return this.asPostPreparingEachEntityTaskGroup({
      async postPreparingEachEntityTemplateTask() {},
    });
  }

  get [BaseApplicationGenerator.DEFAULT]() {
    return this.asDefaultTaskGroup({
      async defaultTemplateTask() {},
    });
  }

  get [BaseApplicationGenerator.WRITING]() {
    return this.asWritingTaskGroup({
      async writingTemplateTask({ application }) {
        application.dbPortValue = undefined;
        await this.writeFiles({
          sections: serverFiles,
          context: application,
        });
      },
    });
  }

  get [BaseApplicationGenerator.WRITING_ENTITIES]() {
    return this.asWritingEntitiesTaskGroup({
      async customEntityServerFiles({ application, entities }) {
        if (this.databaseType === 'mongodb' && this.relationships.length > 0) {
          throw new Error('relationships not supported in mongodb!');
        }

        for (const entity of entities.filter(entity => !entity.skipServer && !entity.builtIn)) {
          await this.writeFiles({
            sections: entityFiles,
            context: { ...application, ...entity },
          });
        }

        /*
        this.fields.forEach(field => {
          if (field.fieldIsEnum === true) {
            const enumFileName = _.kebabCase(field.fieldType);
            const enumInfo = utils.buildEnumInfo(field, this.angularAppName, this.packageName, this.clientRootFolder);
            this.template(
              `${SERVER_NODEJS_DIR}src/domain/enumeration/enum-type.ts.ejs`,
              `${SERVER_NODEJS_DIR}src/domain/enumeration/${enumFileName}.ts`,
              this,
              {},
              enumInfo,
            );
          }
        });
        */
      },
    });
  }

  get [BaseApplicationGenerator.POST_WRITING]() {
    return this.asPostWritingTaskGroup({
      async postWritingTemplateTask() {},
    });
  }

  get [BaseApplicationGenerator.POST_WRITING_ENTITIES]() {
    return this.asPostWritingEntitiesTaskGroup({
      async postWritingEntitiesTemplateTask() {
        // utils.addEntityToAppModuleImport(this, this.entityClass, this.entityFileName);
        // utils.addEntityToAppModule(this, this.entityClass);
      },
    });
  }

  get [BaseApplicationGenerator.END]() {
    return this.asEndTaskGroup({
      async endTemplateTask() {},
    });
  }

  getTsType(fieldType) {
    return fieldTypes[fieldType] || 'any';
  }

  addDbType(fieldType) {
    return sanitizeDbType(dbTypes[fieldType], this.devDatabaseType);
  }
}
