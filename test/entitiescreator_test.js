'use strict';

var chai = require('chai'),
    expect = chai.expect,
    EntitiesCreator = require('../lib/entitiescreator'),
    ParserFactory = require('../lib/editors/parser_factory');

var parser = ParserFactory.createParser('./test/xmi/modelio.xmi', 'sql');
parser.parse();
var creator = new EntitiesCreator(parser,[]);

/* The variables set to do all the constraints */
var parserConstraint =
  ParserFactory.createParser('./test/xmi/test_constraint.xmi', 'sql');
parserConstraint.parse();
var creatorConstraint = new EntitiesCreator(parserConstraint,[]);

/* the entity creator set to do the User Entity tests */
var parserUser =
  ParserFactory.createParser('./test/xmi/user_entity_test.xmi', 'sql');
parserUser.parse();
var creatorUser = new EntitiesCreator(parserUser,[]);

/* the entity creator set to do the User Entity tests */
var parserUserWrong =
  ParserFactory.createParser('./test/xmi/user_entity_wrong_side_relationship.xmi', 'sql');
parserUserWrong.parse();
var creatorUserWrong = new EntitiesCreator(parserUserWrong,[]);



describe('EntitiesCreator ', function(){
  describe('#initialize ', function(){
    describe('when passing valid argument ', function(){
      it('Successfully initialize Entities Parser', function(){
        try {
          creator = new EntitiesCreator(parser,[]);
        } catch (error) {
          throw new ExpectationError();
        }
      });
      it('initializes each of its attributes', function() {
        expect(creator.getPrimitiveTypes()).to.deep.equal(parser.getTypes());
        expect(creator.getClasses()).to.deep.equal(parser.getClasses());
        expect(creator.getFields()).to.deep.equal(parser.getFields());
        expect(creator.getInjectedFields()).to.deep.equal(parser.getInjectedFields());
        expect(creator.getAssociations()).to.deep.equal(parser.getAssociations());

        expect(creator.getEntities()).to.deep.equal({});
      });
      it('initializes each of its attributes', function() {
        expect(creator.getEntities()).to.deep.equal({});
      });
    });
    describe('when passing invalid argument', function(){
      describe('when passing a null argument',function(){
        it('throws an exception',function(){
          try{
            new EntitiesCreator(null);
            fail();
          }catch(error){
            expect(error.name).to.equal('NullArgumentException');
          }
        });
      });
    });
  });
  describe( '#createEntities', function(){

    describe('#initializeEntities', function(){
      before(function(){
          creator.initializeEntities();
          creatorUser.initializeEntities();
      });
      describe('when we intialize Entities', function(){
        it('there are as many Entities as Classes',function(){
          expect(creator.getEntities.length).equal(creator.getClasses.length);
        });
        it("all entities attributs are set",function(){
          expect(creator.getEntities()['_iW0Y-PJjEeSmmZm37nQR-w'].fieldsContainOwnerOneToOne).to.be.defined;
          expect(creator.getEntities()['_iW0Y-PJjEeSmmZm37nQR-w'].fieldsContainOwnerManyToMany).to.be.defined;
          expect(creator.getEntities()['_iW0Y-PJjEeSmmZm37nQR-w'].fieldsContainOneToMany).to.be.defined;
          expect(creator.getEntities()['_iW0Y-PJjEeSmmZm37nQR-w'].fieldsContainLocalDate).to.be.defined;
          expect(creator.getEntities()['_iW0Y-PJjEeSmmZm37nQR-w'].fieldsContainCustomTime).to.be.defined;
          expect(creator.getEntities()['_iW0Y-PJjEeSmmZm37nQR-w'].fieldsContainBigDecimal).to.be.defined;
          expect(creator.getEntities()['_iW0Y-PJjEeSmmZm37nQR-w'].fieldsContainDateTime).to.be.defined;
          expect(creator.getEntities()['_iW0Y-PJjEeSmmZm37nQR-w'].fieldsContainDate).to.be.defined;
          expect(creator.getEntities()['_iW0Y-PJjEeSmmZm37nQR-w'].changelogDate).to.be.defined;
          expect(creator.getEntities()['_iW0Y-PJjEeSmmZm37nQR-w'].dto).to.be.defined;
          expect(creator.getEntities()['_iW0Y-PJjEeSmmZm37nQR-w'].pagination).to.be.defined;
          expect(creator.getEntities()['_iW0Y-PJjEeSmmZm37nQR-w'].validation).to.be.defined;
        });
      });
    });


    describe('#setFieldsOfEntity',function(){
      var firstClassId;
      var fields;

      before(function(){
        firstClassId = Object.keys(creatorConstraint.getClasses())[0];
        creatorConstraint.initializeEntities();
        creatorConstraint.setFieldsOfEntity(firstClassId);
        fields = creatorConstraint.getEntities()[firstClassId].fields;
      });

      describe('when creating enums', function() {
        var otherParser = ParserFactory.createParser(
          './test/xmi/modelio_enum_test.xmi',
          'sql');
        otherParser.parse();
        var otherCreator = new EntitiesCreator(otherParser,[]);
        otherCreator.createEntities();

        var enumFields;

        Object.keys(otherCreator.entities).forEach(function(element) {
          enumFields = otherCreator.entities[element].fields;
        });

        it('adds the values of the enum', function() {
          enumFields.forEach(function(field) {
            if (!field.fieldIsEnum) {
              expect(field.fieldValues).to.equal(undefined);
            } else {
              switch (field.id) {
                case 2:
                case 4:
                  expect(field.fieldValues).to.deep.equal(['VALUE_A,VALUE_B']);
                  break;
                case 3:
                  expect(field.fieldValues).to.deep.equal(['VALUE_A']);
                  break;
              }
            }
          });
        });
        it('creates them by true-ing the enum flag', function() {
          enumFields.forEach(function(field) {
            if (field.fieldValues) {
              expect(field.fieldIsEnum).to.equal(true);
            }
          });
        });
      });

      describe("when fields trying to access an entity field ", function(){
        var field;
        before(function(){
          field = fields[0];
        });

        it("has fieldId property",function(){
          expect(field.fieldId).to.be.defined;
        });

        it("has fieldName property",function(){
          expect(field.fieldName).to.be.defined;
        });

        it("has fieldType property",function(){
          expect(field.fieldType).to.be.defined;
        });

        it("has fieldValidate property",function(){
          expect(field.fieldValidate).to.be.defined;
        });

      });

      /**
       * Here we check the validation gestion, for that purpose we created
       *   a xmi of a class Contrainte with 4 attributs, each with differente
       *   constraints:
       *   - notTooSmall [ required , minlength : 4 ]
       *   - notTooBig [maxlength : 10]
       *   - onlyRequired [ required ]
       *   - noConstraint []
       */
      describe("#setValidationsOfField: ",function(){
        describe('when field has no validation', function(){
          it('fieldValidate is false',function(){
            for(var i in fields){
              if (fields.hasOwnProperty(i)) {
                var field = fields[i];
                if(field.fieldName === "noContraint"){
                  expect(field.fieldValidate).to.equal(false);
                }
              }
            }
          });

          it('fieldValidateRules is undefined',function(){
            for(var i in fields){
              if (fields.hasOwnProperty(i)) {
                var field = fields[i];
                if(field.fieldName === "noContraint"){
                  expect(field.fieldValidateRules).to.be.undefined;
                }
              }
            }
          });

        });
        describe('when field has a required validation', function(){
          it('fieldValidate is true',function(){
            for(var i in fields){
              if (fields.hasOwnProperty(i)) {
                var field = fields[i];
                if(field.fieldName === "notTooSmall" || field.fieldName === "onlyRequired" ){
                  expect(field.fieldValidate).to.equal(true);
                }
              }
            }
          });
          it('has a \'required\' string in fieldValidateRules',function(){
            for(var i in fields){
              if (fields.hasOwnProperty(i)) {
                var field = fields[i];
                if(field.fieldName === "notTooSmall" || field.fieldName === "onlyRequired" ) {
                  expect(field.fieldValidateRules.indexOf("required")).not.to.equal(-1);
                }
              }
            }
          });
        });


      describe('when field has a maxlength validation', function(){
          it('fieldValidate is true',function(){
            for(var i in fields){
              if (fields.hasOwnProperty(i)) {
                var field = fields[i];
                if(field.fieldName === "notTooBig"){
                  expect(field.fieldValidate).to.equal(true);
                }
              }
            }
          });
          it('has a \'maxlength\' string in fieldValidateRules',function(){
            for(var i in fields){
              if (fields.hasOwnProperty(i)) {
                var field = fields[i];
                if(field.fieldName === "notTooBig" ){
                  expect(field.fieldValidateRules.indexOf("maxlength")).not.to.equal(-1);
                }
              }
            }
          });
          it('has a fieldValidateRulesMax with a value of 10',function(){
            for(var i in fields){
              if (fields.hasOwnProperty(i)) {
                var field = fields[i];
                if(field.fieldName === "notTooBig" ){
                  expect(field.fieldValidateRulesMaxlength === "10").to.equal(true);
                }
              }
            }
          });
        });

        describe('when field has a minlength validation', function(){
          it('fieldValidate is true',function(){
            for(var i in fields){
              if (fields.hasOwnProperty(i)) {
                var field = fields[i];
                if(field.fieldName === "notTooSmall"){
                  expect(field.fieldValidate).to.equal(true);
                }
              }
            }
          });
          it('has a \'minlength\' string in fieldValidateRules',function(){
            for(var i in fields){
              if (fields.hasOwnProperty(i)) {
                var field = fields[i];
                if(field.fieldName === "notTooSmall" ){
                  expect(field.fieldValidateRules.indexOf("minlength")).not.to.equal(-1);
                }
              }
            }
          });
          it('has a fieldValidateRulesMin with a value of 4',function(){
            for(var i in fields){
              if (fields.hasOwnProperty(i)) {
                var field = fields[i];
                if(field.fieldName === "notTooSmall" ){
                  expect(field.fieldValidateRulesMinlength === "4").to.equal(true);
                }
              }
            }
          });
        });
      });

    describe('#setRelationshipOfEntity',function(){
      var employeeToJob; // relation one to one owner
      var departmentToEmployee; // relation one to many
      var jobToTask; // relation many to many owner
      var jobToEmployee; // relation one to one not owner
      var taskToJob; // relation many to many not owner
      var employeeToDepartment; // relation many to one
      var entities;

      before(function(){
          creator.createEntities();
          entities = creator.getEntities();

          for (var i=0; i<Object.keys(entities).length; i++){
            var classId = Object.keys(entities)[i];
            var relationships = entities[classId].relationships;

            for(var j=0; j<relationships.length; j++) {
              switch(creator.getClasses()[classId].name) {
                case 'Employee':
                  if(relationships[j].otherEntityNameCapitalized === "Job"){
                    employeeToJob = relationships[j];
                  } else if(relationships[j].otherEntityNameCapitalized === "Department"){
                    employeeToDepartment = relationships[j];
                  }
                  break;
                case 'Department':
                  if(relationships[j].otherEntityNameCapitalized === "Employee"){
                    departmentToEmployee = relationships[j];
                  }
                  break;
                case 'Job':
                  if(relationships[j].otherEntityNameCapitalized === "Employee"){
                    jobToEmployee = relationships[j];
                  }else if(relationships[j].otherEntityNameCapitalized === "Task"){
                    jobToTask = relationships[j];
                  }
                  break;
                case 'Task':
                  if(relationships[j].otherEntityNameCapitalized === "Job"){
                    taskToJob = relationships[j];
                  }
                  break;
                default:
              }
            }
          }
      });

      describe("when trying to access a relationships", function(){

        describe('Employee to Job: One to one owner side', function(){
          it("has a ownerSide property at true ",function(){
            expect(employeeToJob.ownerSide).to.equal(true);
          });
          it("has a one-to-one relationships type",function(){
            expect(employeeToJob.relationshipType).to.equal("one-to-one");
          });
          it("has a relationshipFieldName set at 'job' ",function(){
            expect(employeeToJob.relationshipFieldName).to.equal("job");
          });
        });

        describe('Job to Employee: One-to-One not owner side', function(){
          it("has a ownerSide property at false",function(){
            expect(jobToEmployee.ownerSide).to.equal(false);
          });
          it("has a one-to-one relationships type",function(){
            expect(jobToEmployee.relationshipType).to.equal("one-to-one");
          });
          it("has otherEntityRelationshipName set to job", function(){
            expect(jobToEmployee.otherEntityRelationshipName).to.equal("job");
          });
          it("has a relationshipFieldName set at 'employee' ",function(){
            expect(jobToEmployee.relationshipFieldName).to.equal("employee");
          });
        });

        describe('Department to Employee : One to Many', function(){
          it("has a one-to-many relationships type",function(){
            expect(departmentToEmployee.relationshipType).to.equal("one-to-many");
          });
          it("has no ownerSide property",function(){
            expect(departmentToEmployee.ownerSide).to.be.undefined;
          });
          it("has otherEntityRelationshipName set to department", function(){
            expect(departmentToEmployee.otherEntityRelationshipName).to.equal("department");
          });
        });

        describe('Employee to Department : Many to One', function(){
          it("has a many-to-one relationships type",function(){
            expect(employeeToDepartment.relationshipType).to.equal("many-to-one");
          });
          it("has no ownerSide property",function(){
            expect(employeeToDepartment.ownerSide).to.be.undefined;
          });
        });

        describe('Job to Task : Many to Many owner side', function(){
          it("has a ownerSide property at true ",function(){
            expect(jobToTask.ownerSide).to.equal(true);
          });
          it("has a many-to-many relationships type",function(){
            expect(jobToTask.relationshipType).to.equal("many-to-many");
          });
          it("has a relationshipFieldName set at 'tasks' ",function(){
            expect(jobToTask.relationshipFieldName).to.equal("tasks");
          });
        });

        describe('Task to Job: Many to Many not owner side', function(){
          it("has a ownerSide property at false ",function(){
            expect(taskToJob.ownerSide).to.equal(false);
          });
          it("has a many-to-many relationships type",function(){
            expect(taskToJob.relationshipType).to.equal("many-to-many");
          });

          it("has relationshipFieldName set at 'jobs' ",function(){
            expect(taskToJob.relationshipFieldName).to.equal("jobs");
          });
          it("has otherEntityRelationshipName set at 'task'", function(){
            expect( taskToJob.otherEntityRelationshipName).to.equal("tasks");
          });
        });
      });

      describe("when accessing the entities", function() {
        it("mentions if the class contains a one-to-one relationship", function() {
          Object.keys(creator.getEntities()).forEach(function(entity) {

            creator.getEntities()[entity].relationships.forEach(function(relationship) {
              if (relationship.relationshipType === 'one-to-one' && relationship.ownerSide) {
                expect(creator.getEntities()[entity].fieldsContainOwnerOneToOne).to.equal(true);
              }
            });
          });
        });
      });

      describe('when the model has a bidirectional relationship', function() {
        it('throw an exception', function() {
          var otherParser =
            ParserFactory.createParser('./test/xmi/modelio_bidirectional.xmi', 'sql');
          otherParser.parse();
          var otherCreator = new EntitiesCreator(otherParser, []);
          try {
            otherCreator.createEntities();
            throw new ExpectationError();
          } catch (error) {
            expect(error.name).to.equal('BidirectionalAssociationUseException');
          }

        });
      });
      describe('when the model has relationships and the app has a NoSQL database', function() {
        it('throw an exception', function() {
          try {
            var parserNoSQL_with_relationship =
              ParserFactory.createParser('./test/xmi/modelio.xmi', 'mongodb');
            parserNoSQL_with_relationship.parse();
            new EntitiesCreator(parserNoSQL_with_relationship,[]);
            throw new ExpectationError();
          } catch (error) {
            expect(error.name).to.equal('NoSQLModellingException');
          }
          
        });
      });
    });
  });
  });
  describe('#createEntities with an entity called USER ', function(){
    before(function(){
      creatorUser.createEntities();
    });
    it('there are less Entities as Classes when there is a Class called \'User\'', function(){
      expect(Object.keys(creatorUser.entities).length).to.equal(Object.keys(creatorUser.classes).length-1);
    });

    describe( 'When an association goes to a USER class ' , function(){
      before(function(){
        creatorUserWrong.createEntities();
      });
      it('there is no relationships to USER entity after creating entities', function(){
        expect(Object.keys(creatorUserWrong.entities['_uy4W4g9IEeWa5JwclR5VRw'].relationships).length).to.equal(0);
      });
    });
  });
});

function ExpectationError(message) {
  this.name = 'ExpectationError';
  this.message = (message || '');
}
ExpectationError.prototype = new Error();
