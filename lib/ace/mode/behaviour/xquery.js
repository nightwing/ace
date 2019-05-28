
"use strict";

import oop from '../../lib/oop.js';
import { Behaviour } from '../behaviour.js';
import { CstyleBehaviour } from './cstyle.js';
import { XmlBehaviour } from '../behaviour/xml.js';
import { TokenIterator } from '../../token_iterator.js';

function hasType(token, type) {
    var hasType = true;
    var typeList = token.type.split('.');
    var needleList = type.split('.');
    needleList.forEach(function(needle){
        if (typeList.indexOf(needle) == -1) {
            hasType = false;
            return false;
        }
    });
    return hasType;
}

var XQueryBehaviour = function () {
    
    this.inherit(CstyleBehaviour, ["braces", "parens", "string_dquotes"]); // Get string behaviour
    this.inherit(XmlBehaviour); // Get xml behaviour
    
    this.add("autoclosing", "insertion", function (state, action, editor, session, text) {
      if (text == '>') {
          var position = editor.getCursorPosition();
          var iterator = new TokenIterator(session, position.row, position.column);
          var token = iterator.getCurrentToken();
          var atCursor = false;
          var state = JSON.parse(state).pop();
          if ((token && token.value === '>') || state !== "StartTag") return;
          if (!token || !hasType(token, 'meta.tag') && !(hasType(token, 'text') && token.value.match('/'))){
              do {
                  token = iterator.stepBackward();
              } while (token && (hasType(token, 'string') || hasType(token, 'keyword.operator') || hasType(token, 'entity.attribute-name') || hasType(token, 'text')));
          } else {
              atCursor = true;
          }
          var previous = iterator.stepBackward();
          if (!token || !hasType(token, 'meta.tag') || (previous !== null && previous.value.match('/'))) {
              return;
          }
          var tag = token.value.substring(1);
          if (atCursor){
              var tag = tag.substring(0, position.column - token.start);
          }

          return {
             text: '>' + '</' + tag + '>',
             selection: [1, 1]
          };
      }
  });

};
oop.inherits(XQueryBehaviour, Behaviour);

export { XQueryBehaviour };
