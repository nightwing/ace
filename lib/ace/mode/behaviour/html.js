
"use strict";

import oop from '../../lib/oop';
import { XmlBehaviour } from '../behaviour/xml';

var HtmlBehaviour = function () {

    XmlBehaviour.call(this);

};

oop.inherits(HtmlBehaviour, XmlBehaviour);

export { HtmlBehaviour };
