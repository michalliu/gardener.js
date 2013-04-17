// override DOM API
// this file must place at the top first
/*jshint browser:true*/
(function (global, document, undefine) {

    'use strict';

    var nativeDocumentGetElementById = document.getElementById,
        nativeDocumentGetElementsByName = document.getElementsByName,
        nativeDocumentGetElementsByTagName = document.getElementsByTagName,
        nativeDocumentGetElementsByClassName = document.getElementsByClassName,
        nativeDocumentQuerySelector = document.querySelector,
        nativeDocumentQuerySelectorAll = document.querySelectorAll,
        nativeDocumentElementFromPoint = document.elementFromPoint,
        nativeDocumentCreateElement = document.createElement,
        nativeDocumentCloneNode = document.cloneNode;

    var nativeAddEventListener = document.addEventListener,
        nativeRemoveEventListener = document.removeEventListener;

    var nativeDocumentAttachEvent = document.attachEvent,
        nativeDocumentDetachEvent = document.detachEvent;

    var nativeConsole = global.console; // incase of someone override the console object

    var NativeImage = Image;

    var elementCollection;
    var eventHandlerCollection;

	// don't check these elements, don't clean these elements
	var exceptionList = [];

    var standardElementsProperties = {};

    var warnLevel = 'warn',
        infoLevel = 'info';


    function log() {
        return nativeConsole.log.apply(nativeConsole, arguments);
    }

    function warn() {
        return nativeConsole.warn.apply(nativeConsole, arguments);
    }

    function describeElement(inElement) {
        var result = [];
        if (inElement) {
            result.push(inElement.nodeName);
            if (inElement.id) {
                result.push('#'+inElement.id);
            }
            if (inElement.className) {
                result.push('.'+inElement.className.replace(/\s+/g,'.'));
            }
        }
        return '[' + result.join('') + ']';
    }

    function removeQuotes(inStr) {
        return inStr.replace(/^"/,'').replace(/"$/,'');
    }

    function isOrphanElement(inElement) {
        return !inElement.parentNode &&
                    inElement.children.length <= 0;
    }

    function exists(inArray, inElement) {
        for (var i=0,l=inArray.length, el; i<l;i++) {
            el = inArray[i];
            if (el === inElement) {
                return true;
            }
        }
        return false;
    }

    function describeFunction (inFunction) {
        var fnStr = inFunction.toString();
        var startPartLen = 80,
            endPartLen = 50;
        var totalLen = startPartLen + endPartLen;
        var startPart,endPart;
        if (fnStr.length <= totalLen) {
            return removeQuotes(JSON.stringify(fnStr));
        } else {
            startPart = fnStr.substr(0, startPartLen);
            endPart = fnStr.substr(fnStr.length - endPartLen, endPartLen);
            return removeQuotes(JSON.stringify(startPart)) + '...' + removeQuotes(JSON.stringify(endPart));
        }
    }

    function initializeProperties(target, members) {
        var keys = Object.keys(members);
        var properties;
        var i, len;
        for (i = 0, len = keys.length; i < len; i++) {
            var key = keys[i];
            var enumerable = key.charCodeAt(0) !== /*_*/95;
            var member = members[key];
            if (member && typeof member === 'object') {
                // use Object.defineProperty
                // for getter setter
                if (member.value !== undefined ||
                        typeof member.get === 'function' ||
                        typeof member.set === 'function') {
                    if (member.enumerable === undefined) {
                        member.enumerable = enumerable;
                    }
                    properties = properties || {};
                    properties[key] = member;
                    continue;
                }
            }
            if (!enumerable) {
                // use Object.defineProperty
                // for enumerable
                properties = properties || {};
                properties[key] = { value: member, enumerable: enumerable, configurable: true, writable: true };
                continue;
            }
            // standard assign
            target[key] = member;
        }
        // define properties
        if (properties) {
            Object.defineProperties(target, properties);
        }
    }
    // override document property
    // TODO:activeElement
    var documentPropertyOverride = {
        getElementById: function (inId) {
            /*jshint unused:false*/
            var el = nativeDocumentGetElementById.apply(this, arguments);
            traceElements(el);
            return el;
        },
        getElementsByName: function (inName) {
            /*jshint unused:false*/
            var els = nativeDocumentGetElementsByName.apply(this, arguments);
            traceElements(els);
            return els;
        },
        elementFromPoint: function (x, y) {
            /*jshint unused:false*/
            return traceElements(nativeDocumentElementFromPoint.apply(this, arguments));
        },
        createElement: function (inElementName) {
            /*jshint unused:false*/
            var el = nativeDocumentCreateElement.apply(this, arguments);
            traceElements(el);
            return el;
        }
    };

    // override element property
    var elementPropertyOverride = {
        cloneNode: function () {
            return traceElements(nativeDocumentCloneNode.apply(this,arguments));
        },
        getElementsByTagName: function (inTagName) {
            /*jshint unused:false*/
            var els;
            var methodProvider;
            if (this === document) {
                els = nativeDocumentGetElementsByTagName.apply(this, arguments);
            } else {
                methodProvider = nativeDocumentCreateElement.call(document, this.nodeName);
                els = methodProvider.getElementsByTagName.apply(this, arguments);
            }
            traceElements(els);
            return els;
        },
        getElementsByClassName: function (inClassName) {
            /*jshint unused:false*/
            var els;
            var methodProvider;
            if (this === document) {
                els = nativeDocumentGetElementsByClassName.apply(this, arguments);
            } else {
                methodProvider = nativeDocumentCreateElement.call(document, this.nodeName);
                els = methodProvider.getElementsByClassName.apply(this, arguments);
            }
            traceElements(els);
            return els;
        },
        querySelector: function (inSelector) {
            /*jshint unused:false*/
            var methodProvider;
            var el;
            if (this === document) {
                el = nativeDocumentQuerySelector.apply(this, arguments);
            } else {
                methodProvider = nativeDocumentCreateElement.call(document, this.nodeName);
                el = methodProvider.querySelector.apply(this,arguments);
            }
            traceElements(el);
            return el;
        },
        querySelectorAll: function (inSelector) {
            /*jshint unused:false*/
            var methodProvider;
            var els;
            if (this === document) {
                els = nativeDocumentQuerySelectorAll.apply(this, arguments);
            } else {
                methodProvider = nativeDocumentCreateElement.call(document, this.nodeName);
                els = methodProvider.querySelectorAll.apply(this,arguments);
            }
            traceElements(els);
            return els;
        },
        addEventListener: function (inEventName, inHandler, inUseCapture) {
            traceEventHandler(this, inEventName, inHandler, inUseCapture);
            return nativeAddEventListener.apply(this, arguments);
        },
        removeEventListener: function (inEventName, inHandler, inUseCapture) {
            unTraceEventHandler(this, inEventName, inHandler, inUseCapture);
            return nativeRemoveEventListener.apply(this, arguments);
        }
    };

    var msElementPropertyOverride = {
        attachEvent: function (inEventName, inHandler, inUseCapture) {
            var methodProvider;
            var nativeAttachEvent;
            if (this === document) {
                nativeAttachEvent = nativeDocumentAttachEvent;
            } else {
                methodProvider = nativeDocumentCreateElement.call(document, this.nodeName);
                nativeAttachEvent = methodProvider.attachEvent;
            }
            traceEventHandler(this, inEventName, inHandler, inUseCapture);
            return nativeAttachEvent.apply(this, arguments);
            // throw new Error("attachEvent is prohibited , use addEventListener instead");
        },
        detachEvent: function (inEventName, inHandler, inUseCapture) {
            var methodProvider;
            var nativeDetachEvent;
            if (this === document) {
                nativeDetachEvent = nativeDocumentDetachEvent;
            } else {
                methodProvider = nativeDocumentCreateElement.call(document, this.nodeName);
                nativeDetachEvent = methodProvider.detachEvent;
            }
            unTraceEventHandler(this, inEventName, inHandler, inUseCapture);
            return nativeDetachEvent.apply(this, arguments);
            // throw new Error("detachEvent is prohibited , use removeEventListener instead");
        }
    };

    if (nativeDocumentAttachEvent) {
        initializeProperties(elementPropertyOverride,msElementPropertyOverride);
    }

    // add elements to our tracing list
    // TODO: need remove duplicated item？
	// I said no. It will cutdown the performance
    function traceElements(inElements) {
        var elements;
        if (elementCollection && inElements) {
            // NodeList or HTMLCollection or an array of elements
            if (inElements.length !== undefine && inElements.length > 0) {
                // trace elements as much as possible
                elements = Array.prototype.slice.call(inElements);
                elements.forEach(function (element) {
                    initializeProperties(element, elementPropertyOverride);
                });
                elementCollection = elementCollection.concat(elements);
				elements.length = 0;
            } else if(inElements.nodeType === 1 || inElements.nodeType === 9) {
                initializeProperties(inElements, elementPropertyOverride);
                elementCollection.push(inElements);
            }
        }
        return inElements;
    }


    // check the element for problems (has a non-standard property)
    // onFail will be called if the element is not clean
    function checkElement(inElement, onFail) {
        var nodeName,
            standardElement,
            standardElementProperties,
            nodeProperty;

        if (inElement &&
                (inElement.nodeType === 1 || inElement.nodeType === 9) && // element or document
				!exists(exceptionList, inElement) // trust element in the whitelist
                ) {
            nodeName = inElement.nodeName;
            standardElementProperties = standardElementsProperties[nodeName];
            // store all the properies from the clean element
            if (!standardElementProperties) {
                // create a completely clean element
                standardElement = nativeDocumentCreateElement.call(document, nodeName);

                // store all the properties
                standardElementProperties = {};
                for (nodeProperty in standardElement) {
                    /*jshint forin:false*/
                    standardElementProperties[nodeProperty] = true;
                }
                // cache the map
                standardElementsProperties[nodeName] = standardElementProperties;
            }

            // Noted this can not check the customed property start with a underscore
            // like _activeElement since they aren't enumerable
            for (nodeProperty in inElement) {
                // don't check if its really equal
                // just need to know the property is existed or not
                // since we might alter the implementation
                if (/^on/.test(nodeProperty) &&
                    inElement[nodeProperty] !== null) {
                    // onclick, onmousemove... etc
                    // although they are standard proerpties, they still need to be removed
                    onFail(nodeProperty);
                } else if (inElement.hasOwnProperty(nodeProperty) &&
                    !standardElementProperties[nodeProperty]) { // a non-standard property detected
					
                    if (inElement[nodeProperty] !== null) { // the non-standard property should be null
                        // sometimes the node has a 'msParentSlectorScope' property
                        // we still consider it is clean
                        if (nodeProperty !== 'msParentSelectorScope') {
                            onFail(nodeProperty);
                        }
                    }
                }
            }
        }
    }

    // clean element without custom properties(set it to null)
    function cleanElement(inElement) {
        checkElement(inElement, function (property) {
            inElement[property] = null;
        });
    }


    // clean all the traced elements
    function cleanTracedElement() {
        if (elementCollection && elementCollection.length > 0) {
            for (var i = elementCollection.length-1, element; i >= 0; i--) {
                element = elementCollection[i];
                if (element) {
                    cleanElement(element);
                }
                elementCollection.splice(i,1);
            }
        }
    }

    // trace element handlers
    function traceEventHandler(inElement, inEventName, inHhandler, inUseCapture) {
        inUseCapture = !!inUseCapture;
        if (eventHandlerCollection && inElement && inEventName && inHhandler) {
            eventHandlerCollection.push({
                element: inElement,
                eventName: inEventName,
                handler: inHhandler,
                useCapture: inUseCapture
            });
        }
    }

    // untrace element handler
    function unTraceEventHandler(inElement, inEventName, inHhandler, inUseCapture) {
        inUseCapture = !!inUseCapture;
        if (eventHandlerCollection && inElement && inEventName && inHhandler) {
            for (var i = eventHandlerCollection.length-1, collection; i >= 0; i--) {
                collection = eventHandlerCollection[i];
                if (collection &&
                    collection.element === inElement &&
                    collection.eventName === inEventName &&
                    collection.handler === inHhandler &&
                    collection.useCapture === inUseCapture) {
                    eventHandlerCollection.splice(i, 1);
                }
            }
        }
    }

    // remove all the event handlers
    function cleanEventHandlers() {
        var removeEventListener;
        if (eventHandlerCollection && eventHandlerCollection.length > 0) {
            for (var i = eventHandlerCollection.length-1, collection; i >= 0; i--) {
                collection = eventHandlerCollection[i];
                if (collection &&
						!exists(exceptionList, collection.element)) {
                    if (/^on/.test(collection.eventName)) {
                        removeEventListener = collection.element.detachEvent;
                        removeEventListener.call(collection.element,
                            collection.eventName, collection.handler, collection.useCapture);
                    } else {
                        removeEventListener = collection.element.removeEventListener;
                        removeEventListener.call(collection.element,
                            collection.eventName, collection.handler, collection.useCapture);
                    }
                }
                eventHandlerCollection.splice(i,1);
            }
        }
    }

    // check if all the traced elements is clean
    function checkTracedElements() {
        var report = [];
        var element;
        var level;

        function generateReport(property) {
            level = warnLevel;
            report.push(level + ': ' + describeElement(element) +
                    ' has '+(/^on/.test(property) ? 'event handler' : 'custom property') + ' [' + property + ']' +
                ' which value is [' + describeFunction(element[property]) + ']');
        }

        if (elementCollection && elementCollection.length > 0) {
            for (var i = elementCollection.length-1; i >= 0; i--) {
                element = elementCollection[i];
                checkElement(element, generateReport);
                if (element && isOrphanElement(element) &&
						!exists(exceptionList, element)) { // trust element in the whitelist
                    level = infoLevel;
                    report.push(level + ': ' + describeElement(element) +
                            ' is orphan');
                }
            }
        }
        return report;
    }

    // report how many event listeners not removed properly
    function checkEventHandlers() {
        var report = [];
        var uniqueElements = [];
        var level;
		var hanldersNotRemovedCount = 0;
        if (eventHandlerCollection && eventHandlerCollection.length > 0) {
            level = warnLevel;
            eventHandlerCollection.forEach(function (collection) {
                var el = collection.element,
                    eventName = collection.eventName,
                    handler = collection.handler;
				// trust element in the whitelist even the handler not removed
				if (!exists(exceptionList, el)) { 
                    report.push(level + ': ' + describeElement(el) +
                        ' has [' + eventName + '] event handler ' +
                        '[' + describeFunction(handler) + ']');

                    if (!exists(uniqueElements, el)) {
                        uniqueElements.push(el);
                    }
					hanldersNotRemovedCount++;
				}

            });
			if (hanldersNotRemovedCount > 0) {
                level=infoLevel;
                report.push(level + ': ' +
                        eventHandlerCollection.length + ' handlers not removed, ' +
                        uniqueElements.length + ' elements involved');
			}
        }
        uniqueElements.length = 0;
        return report;
    }

    // override document properties
    initializeProperties(document, documentPropertyOverride);
    initializeProperties(document, elementPropertyOverride);

    // Override global Image object
    global.Image = function () {
        var image = new NativeImage();
        var nativeImageAddEventListener = image.addEventListener;
        var nativeImageRemoveEventListener = image.removeEventListener;
        initializeProperties(image, {
            addEventListener: function (inEventName, inHandler, inUseCapture) {
               traceEventHandler(this, inEventName, inHandler, inUseCapture);
               return nativeImageAddEventListener.apply(this, arguments);
            },
            removeEventListener: function (inEventName, inHandler, inUseCapture) {
                unTraceEventHandler(this, inEventName, inHandler, inUseCapture);
                return nativeImageRemoveEventListener.apply(this, arguments);
            }
        });
        if (nativeDocumentAttachEvent) {
            initializeProperties(image,msElementPropertyOverride);
        }
        return traceElements(image);
    };

    // initialize gardener API
    global.gardener = {};
    initializeProperties(global.gardener, {
        // start collect element and event listeners
        start: function () {
            if (!elementCollection &&
                !eventHandlerCollection) {
                elementCollection = [];
                eventHandlerCollection = [];
            } else {
                warn('gardener started already');
            }
        },
        // retrieve all the traced elements
        elements: {
            get: function () {
                // elementCollection.forEach(function (element) {
                    /*jshint unused:false*/
                    //log('#' + element.id + '.' + element.className);
                // });
                return elementCollection;
            }
        },
        // retrieve all the event handlers
        handlers: {
            get: function () {
                return eventHandlerCollection;
            }
        },
        // clean all the elements and event handlers
        clean: function () {
            // clean all the traced elements w/o custom propery
            // release all the references
            cleanTracedElement();
            // remove all the event handlers
            // release all the references
            cleanEventHandlers();
            log('gardener has cleaned everything');
        },
        // release all the elements and handerls but does nothing
        end: function () {
            if (!elementCollection ||
                    !eventHandlerCollection) {
                warn('gardener is not started');
            }
            if (elementCollection) {
                elementCollection.length = 0;
                elementCollection = null;
            }
            if (eventHandlerCollection){
                eventHandlerCollection.length = 0;
                eventHandlerCollection = null;
            }
        },
		// we will hold a reference of the element, and never release it
		except: function (inElements) {
			if (inElements.length !== undefine && inElements.length > 0) {
				for (var i=0,l=inElements.length, inElement;i<l;i++) {
					inElement = inElements[i];
					this.except(inElement);
				}
				return;
			}
			if (!exists(exceptionList, inElements)) {
				exceptionList.push(inElements);
			}
		},
		exceptions:{
			get: function (){
				return exceptionList;
			}
		},
        // report the status
        status: function () {
            var report = [];
            report = report.concat(checkEventHandlers());
            report = report.concat(checkTracedElements());
            if (report.length > 0) {
                log(report.join('\n'));
            } else {
                log('you are good, everything is fine.');
            }
            return report;
        },
        // gardener end and cleanup
        endclean: function () {
            this.clean();
            this.end();
        }
    });
}(window, window.document));
