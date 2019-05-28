
"use strict";

import oop from '../../lib/oop.js';
import { XmlBehaviour } from '../behaviour/xml.js';

var HtmlBehaviour = function () {

    XmlBehaviour.call(this);

};

oop.inherits(HtmlBehaviour, XmlBehaviour);

export { HtmlBehaviour };
