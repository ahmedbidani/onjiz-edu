'use strict';

module.exports = {
  attributes: {
    student: {
      model: 'student'
    },
    medical: {
      model: 'medical'
    },
    height: {
      type: 'number',
      description: 'student height',
      example: '85.5'
    },
    weight: {
      type: 'number',
      description: 'student weight',
      example: '10'
    },
    bloodGroup: {
      type: 'string',
      description: 'Student blood group',
      example: 'AB, O, A'
    },
    allergy: {
      type: 'string',
      description: 'which food student can not eat',
      example: 'seafood, chicken'
    },
    heartRate: {
      type: 'string',
      description: 'Heart rate of student',
      example: 'normal, slow, fast'
    },
    eyes: {
      type: 'string',
      description: 'eyes of student',
      example: 'good, not good'
    },
    ears: {
      type: 'string',
      description: 'ears of student',
      example: 'good,not good'
    },
    notes: {
      type: 'string'
    }
  }
};