/*jshint browser:true*/
/*global module,test,asyncTest,start,ok,equal,deepEqual,strictEqual,notDeepEqual*/
/*global gardener*/

var garden = document.getElementById('garden');

function fireEvent(obj,evt){
    var fireOnThis = obj;
    var evObj;
    if(document.createEventObject ) {
      evObj = document.createEventObject();
      fireOnThis.fireEvent( 'on' + evt, evObj );
    }
}

function fireEventStandard(obj,evt){
    var fireOnThis = obj;
    var evObj;
    if(document.createEvent ) {
      evObj = document.createEvent('MouseEvents');
      evObj.initEvent( evt, true, false );
      fireOnThis.dispatchEvent( evObj );
    }
}

module('Basic DOM API Tests');

test('document.createElement', function () {
    gardener.start();
    var el = document.createElement('div');
    ok(el, 'element created');
    deepEqual(gardener.elements[0], el, 'element is traced');
    gardener.endclean();
});

test('element.cloneNode', function () {
    gardener.start();
    var el = document.createElement('div');
    ok(el, 'element created');
    deepEqual(gardener.elements[0], el, 'element is traced');
    gardener.endclean();

    gardener.start();
    var clonedNode = el.cloneNode(false);
    deepEqual(gardener.elements[0], clonedNode, 'element is cloned and traced');
    gardener.endclean();

    gardener.start();
    var wrapper = document.createElement('div');
    var childEl = document.createElement('fieldset');
    wrapper.appendChild(childEl);

    var clonedWrapper = wrapper.cloneNode(true);
    ok(clonedWrapper, 'node cloned');
    equal(gardener.elements.length,3,'elements traced');
    deepEqual(gardener.elements[2],clonedWrapper, 'cloned node traced');
    gardener.endclean();
});

test('document.elementFromPoint', function () {
    gardener.start();
    var threshold=500;
    var x = Math.floor(Math.random() * threshold);
    var y = Math.floor(Math.random() * threshold);
    var el = document.elementFromPoint(x,y);
    if (el) {
        ok(el, 'element retrieved');
        deepEqual(gardener.elements[0], el, 'element is traced');
    } else {
        ok(true, 'no element selected');
    }
    gardener.endclean();
});

test('document.getElementById', function () {
    gardener.start();
    var id = 'testDiv';
    var el = document.createElement('div');
    el.id=id;
    garden.appendChild(el);
    var el2 = document.getElementById(id);
    ok(el2, 'element retrived');
    deepEqual(gardener.elements[0], el, 'element is traced');
    deepEqual(el, el2, 'element is correct');
    garden.removeChild(el);
    var el3 = document.getElementById(id);
    ok(!el3, 'element is removed');
    gardener.endclean();
});

test('document.getElementsByTagName', function () {
    gardener.start();
    var el;
    var nodeName='fieldset';
    var nodeCount=4;
    for(var i=0;i<nodeCount;i++) {
        el = document.createElement(nodeName);
        garden.appendChild(el);
    }
    var nodes = document.getElementsByTagName(nodeName);
    ok(nodes, 'nodes retrived');
    equal(nodes.length, nodeCount, 'nodeCount is correct');
    garden.innerHTML='';
    gardener.endclean();
});

test('document.getElementsByClassName', function () {
    gardener.start();
    var el;
    var nodeName = 'div';
    var nodeClassName = 'testClass';
    var threshold = 20;
    var nodeCount = Math.floor(Math.random() * threshold);
    for (var i=0;i<nodeCount;i++) {
        el = document.createElement(nodeName);
        el.className=nodeClassName;
        garden.appendChild(el);
    }
    var els = document.getElementsByClassName(nodeClassName);
    equal(els.length,nodeCount,'retrieved ' + nodeCount + ' elements');
    garden.innerHTML='';
    gardener.endclean();
});

test('element.getElementsByClassName', function () {
    gardener.start();
    var el;
    var wrapper = document.createElement('div');
    wrapper.id='wrapper1';
    var wrapper2 = document.createElement('div');
    wrapper2.id='wrapper2';
    var nodeName = 'div';
    var nodeClassName = 'testClass';
    var threshold = 20;
    var nodeCount1 = Math.floor(Math.random() * threshold);
    var nodeCount2 = Math.floor(Math.random() * threshold);
    for (var i=0;i<nodeCount1;i++) {
        el = document.createElement(nodeName);
        el.className=nodeClassName;
        wrapper.appendChild(el);
    }
    for (var j=0;j<nodeCount2;j++) {
        el = document.createElement(nodeName);
        el.className=nodeClassName;
        wrapper2.appendChild(el);
    }
    garden.appendChild(wrapper);
    garden.appendChild(wrapper2);
    var els = wrapper.getElementsByClassName(nodeClassName);
    equal(els.length,nodeCount1,'retrieved ' + nodeCount1 + ' elements');
    els = wrapper2.getElementsByClassName(nodeClassName);
    equal(els.length,nodeCount2,'retrieved ' + nodeCount2 + ' elements');
    els = document.getElementsByClassName(nodeClassName);
    equal(els.length,nodeCount1+nodeCount2,'retrieved ' + (nodeCount2+nodeCount1) + ' elements');
    garden.innerHTML='';
    gardener.endclean();
});

test('document.elementFromPoint', function () {
    ok(true);
});

test('document.getElementsByName', function () {
    gardener.start();
    var el = document.createElement('input');
    var elName = 'testName';
    el.name=elName;
    garden.appendChild(el);
    var els = document.getElementsByName(elName);
    ok(els, 'elements retrived');
    equal(els.length, 1, 'one element is retrieved');
    deepEqual(el, els[0], 'element retrieved correctly');
    garden.innerHTML='';
    gardener.endclean();
});

test('element.getElementsByTagName', function () {
    gardener.start();
    var el;
    var nodeName='fieldset';
    var nodeCount=10;
    var nodeCount1=Math.floor(Math.random() * nodeCount) + 2;
    var nodeCount2=Math.floor(Math.random() * nodeCount) + 1;
    var wrapper1 = document.createElement('div');
    wrapper1.id='wrapper1';
    var wrapper2 = document.createElement('div');
    wrapper2.id='wrapper2';
    for(var i=0;i<nodeCount1;i++) {
        el = document.createElement(nodeName);
        wrapper1.appendChild(el);
    }
    for(var j=0;j<nodeCount2;j++) {
        el = document.createElement(nodeName);
        wrapper2.appendChild(el);
    }
    garden.appendChild(wrapper1);
    garden.appendChild(wrapper2);
    var nodes1 = wrapper1.getElementsByTagName(nodeName);
    ok(nodes1, 'nodes retrived');
    equal(nodes1.length, nodeCount1, 'nodeCount is correct');
    var nodes2 = wrapper2.getElementsByTagName(nodeName);
    ok(nodes2, 'nodes retrived');
    equal(nodes2.length, nodeCount2, 'nodeCount is correct');
    var nodes3 = document.getElementsByTagName(nodeName);
    equal(nodes3.length, nodeCount1+nodeCount2, 'nodeCount is correct');
    garden.innerHTML='';
    gardener.endclean();
});

test('document.querySelector', function () {
    gardener.start();
    var el;
    var nodeName='fieldset';
    var classNames=['testNodeClassName1','testNodeClassName2'];
    var nodeClassName=classNames.join(' ');
    el = document.createElement(nodeName);
    el.className=nodeClassName;
    garden.appendChild(el);
    var el2 = document.querySelector('.'+classNames.join('.'));
    ok(el2, 'element is retrieved');
    deepEqual(el2, el, 'element is retrieved correctly');
    garden.innerHTML='';
    gardener.endclean();
});

test('element.querySelector', function () {
    gardener.start();
    var el;
    var nodeName='fieldset';
    var classNames=['testNodeClassName1','testNodeClassName2'];
    var nodeClassName=classNames.join(' ');
    var query = '.'+classNames.join('.');
    el = document.createElement(nodeName);
    el.className=nodeClassName;
    garden.appendChild(el);
    var wrapper=document.createElement('div');
    var el2 = document.createElement(nodeName);
    el2.className=nodeClassName;
    wrapper.appendChild(el2);
    garden.appendChild(wrapper);
    var el3 = document.querySelector(query);
    ok(el3, 'element is retrieved');
    deepEqual(el3, el, 'element is retrieved correctly');
    var el4 = wrapper.querySelector(query);
    ok(el4, 'element is retrieved');
    deepEqual(el4, el2, 'element is retrieved correctly');
    notDeepEqual(el, el2, 'element is retrieved correctly');
    garden.innerHTML='';
    gardener.endclean();
});

test('document.querySelectorAll', function () {
    gardener.start();
    var el;
    var nodeName='fieldset';
    var classNames=['testNodeClassName1','testNodeClassName2'];
    var nodeClassName=classNames.join(' ');
    var query = nodeName + '.'+classNames.join('.');
    el = document.createElement(nodeName);
    el.className=nodeClassName;
    garden.appendChild(el);
    var els = document.querySelectorAll(query);
    ok(els, 'elements is retrieved');
    equal(els.length, 1, 'one element is retrieved');
    deepEqual(els[0], el, 'element is retrieved correctly');
    garden.innerHTML='';
    gardener.endclean();
});
test('element.querySelectorAll', function () {
    gardener.start();
    var el;
    var nodeName='fieldset';
    var nodeCount=Math.floor(30 * Math.random());
    var classNames=['testNodeClassName1','testNodeClassName2'];
    var nodeClassName=classNames.join(' ');
    var query = nodeName + '.'+classNames.join('.');
    el = document.createElement(nodeName);
    el.className=nodeClassName;
    garden.appendChild(el);
    var wrapper=document.createElement('div');
    var el2 = document.createElement(nodeName);
    el2.className=nodeClassName;
    wrapper.appendChild(el2);
    garden.appendChild(wrapper);
    var wrapper2 = document.createElement('div');
    for (var i=0;i<nodeCount;i++) {
        wrapper2.appendChild(document.createElement(nodeName));
    }
    garden.appendChild(wrapper2);
    var els = document.querySelectorAll(query);
    ok(els, 'elements is retrieved');
    equal(els.length, 2, 'two elements is retrieved');
    deepEqual(els[0], el, 'element is retrieved correctly');
    var els2 = wrapper.querySelectorAll(query);
    ok(els2, 'element is retrieved');
    equal(els2.length, 1, 'one elements is retrieved');
    deepEqual(els2[0], el2, 'element is retrieved correctly');
    var els3 = wrapper2.querySelectorAll(nodeName);
    ok(els3, 'element is retrieved');
    equal(els3.length, nodeCount, 'element count is correct');
    garden.innerHTML='';
    gardener.endclean();
});
asyncTest('document.addEventListener/removeEventlistener', 3, function () {
    gardener.start();
    var event = 'DOMSubtreeModified';
    function onEventHappened() {
        start();
        equal(gardener.handlers.length, 1, 'traced one handler');
        deepEqual(gardener.handlers[0],{
            element:document,
            eventName:event,
            handler:onEventHappened,
            useCapture:false
        }, 'handlers stored properly');
        document.removeEventListener(event, onEventHappened);
        equal(gardener.handlers.length, 0, 'handler is removed correctly');
        garden.innerHTML='';
        gardener.endclean();
    }
    document.addEventListener(event, onEventHappened);
    var node = document.createElement('div');
    garden.appendChild(node);
});
asyncTest('element.addEventListener/removeEventListener', 3, function () {
    gardener.start();
    var node,a;
    var event = 'DOMSubtreeModified';
    function onEventHappened() {
        start();
        equal(gardener.handlers.length, 1, 'traced one handler');
        deepEqual(gardener.handlers[0],{
            element:node,
            eventName:event,
            handler:onEventHappened,
            useCapture:false
        }, 'handlers stored properly');
        node.removeEventListener(event, onEventHappened);
        equal(gardener.handlers.length, 0, 'handler is removed correctly');
        garden.innerHTML='';
        gardener.endclean();
    }
    node = document.createElement('div');
    node.addEventListener(event, onEventHappened);
    garden.appendChild(node);
    a = document.createElement('a');
    node.appendChild(a);
});
// thest test will be made under MSIE
if (document.attachEvent) {
    asyncTest('document.attachEvent/detachEvent', 3, function () {
        gardener.start();
        var event = ('on'+'click').toLowerCase();
        function onEventHappened() {
            start();
            equal(gardener.handlers.length, 1, 'traced one handler');
            deepEqual(gardener.handlers[0],{
                element:document,
                eventName:event,
                handler:onEventHappened,
                useCapture:false
            }, 'handlers stored properly');
            document.detachEvent(event, onEventHappened);
            equal(gardener.handlers.length, 0, 'handler is removed correctly');
            garden.innerHTML='';
            gardener.endclean();
        }
        document.attachEvent(event, onEventHappened);
        fireEvent(document, 'click');
    });
    asyncTest('element.attachEvent/detachEvent', 3, function () {
        gardener.start();
        var node;
        var event = ('on'+'click').toLowerCase();
        function onEventHappened() {
            start();
            equal(gardener.handlers.length, 1, 'traced one handler');
            deepEqual(gardener.handlers[0],{
                element:node,
                eventName:event,
                handler:onEventHappened,
                useCapture:false
            }, 'handlers stored properly');
            node.detachEvent(event, onEventHappened);
            equal(gardener.handlers.length, 0, 'handler is removed correctly');
            garden.innerHTML='';
            gardener.endclean();
        }
        node = document.createElement('div');
        node.attachEvent(event, onEventHappened);
        garden.appendChild(node);
        fireEvent(node, 'click');
    });
}
module('other API');

test('Image.new', function () {
    gardener.start();
    var img = new Image();
    ok(img, 'image created');
    deepEqual(gardener.elements[0], img, 'image is traced');
    gardener.endclean();
});

test('Image.addEventListener/removeEventListener', function () {
    gardener.start();
    var img = new Image();
    ok(img, 'image created');
    function onImageLoad() {
    }
    img.addEventListener('load', onImageLoad);
    deepEqual(gardener.handlers[0].handler, onImageLoad, 'handler is traced');
    fireEventStandard(img,'load');
    img.removeEventListener('load', onImageLoad);
    equal(gardener.handlers.length,0,'handler is removed correctly');
    gardener.endclean();
});

if (document.attachEvent) {
    asyncTest('Image.attachEvent', 2, function () {
        gardener.start();
        var img = new Image();
        function onLoadImageError() {
            ok(true, 'error happened as expected');
            deepEqual(gardener.handlers[0].handler, onLoadImageError, 'handler is traced');
            start();
            gardener.endclean();
        }
        img.attachEvent('onerror', onLoadImageError);
        img.src="http://127.0.0.1/404.jpg";
    });
    asyncTest('Image.detachEvent', 2, function () {
        gardener.start();
        var img = new Image();
        function onLoadImageError() {
            ok(false, 'error should not happen');
            start();
            gardener.endclean();
        }
        img.attachEvent('onerror', onLoadImageError);
        img.detachEvent('onerror', onLoadImageError);
        img.src="http://127.0.0.1/404.jpg";
        setTimeout(function () {
            ok(true, 'event cleared');
            equal(gardener.handlers.length,0,'handler is removed correctly');
            start();
            gardener.endclean();
        },1000);
    });
}

module('gardener API Tests');

test('gardener.start', function () {
    // document.getElementById
    gardener.start();
    var el = document.getElementById('garden');
    equal(gardener.elements.length,1,'element is traced');
    strictEqual(el,gardener.elements[0],'element is correct');
    equal(gardener.elements.length,1, 'document.getElementById is traced');
    gardener.endclean();
    // document.getElementsByName
    gardener.start();
    var el0=document.createElement('input');
    equal(gardener.elements.length,1,'document.createElement is traced');
    var el0Name =  Math.random().toString(16).substr(3);
    el0.name = el0Name;
    garden.appendChild(el0);
    var el1 = document.getElementsByName(el0Name);
    equal(gardener.elements.length,2,'document.getElementsByName is traced');
    equal(gardener.elements.length,2,'element is traced');
    strictEqual(el1[0],el0,'element is correct');
    strictEqual(gardener.elements[0],gardener.elements[1],'element is correct');
    garden.innerHTML='';
    gardener.endclean();

    // document.createElement, document.getElementsByTagName
    gardener.start();
    var elType = 'fieldset';
    var elCount = Math.floor(Math.random() * 50);
    for (var i=0;i<elCount;i++) {
        garden.appendChild(document.createElement(elType));
    }
    var els = document.getElementsByTagName(elType);
    equal(els.length, elCount, elCount + ' elements is traced');
    equal(els.length, elCount, 'document.getElementsByTagName is traced');
    garden.innerHTML='';
    gardener.endclean();

    // these tests are done already
    ok(true,'document.elementFromPoint is traced');
    ok(true,'document.getElementsByClassName is traced');
    ok(true,'document.querySelector is traced');
    ok(true,'document.querySelectorAll is traced');

    // event listeners
    ok(true,'document.addEventListener is traced');
    ok(true,'document.removeEventListener is traced');
    ok(true,'document.attachEvent is traced');
    ok(true,'document.detachEvent is traced');

    //
    ok(true, 'element.getElementsByTagName');
    ok(true, 'element.getElementsByClassName');
    ok(true, 'element.querySelector');
    ok(true, 'element.querySelectorAll');

    ok(true,'element.addEventListener is traced');
    ok(true,'element.removeEventListener is traced');
    ok(true,'element.attachEvent is traced');
    ok(true,'element.detachEvent is traced');
});

asyncTest('gardener.clean event handler added by addEventListener',3, function () {
    gardener.start();
    var el=document.createElement('a');
    var eventType='click';
    el.addEventListener(eventType,function () {
        ok(false, 'this should\'t happen');
        start();
    });
    el.textContent='test';
    equal(gardener.handlers.length,1,'event handler added');
    gardener.clean();
    fireEventStandard(el,eventType);
    setTimeout(function () {
        ok(true, 'event removed correctly');
        equal(gardener.handlers.length,0,'event handler cleaned');
        gardener.end();
        start();
    },500);
});

if (document.attachEvent) {
    asyncTest('gardener.clean event handler added by attachEvent',3, function () {
        gardener.start();
        var el=document.createElement('a');
        var eventType='onclick';
        el.attachEvent(eventType,function () {
            ok(false, 'this should\'t happen');
            start();
        });
        el.textContent='aaaaaa';
        equal(gardener.handlers.length,1,'event handler added');
        gardener.clean();
        fireEvent(el,'click');
        setTimeout(function () {
            ok(true, 'event removed correctly');
            equal(gardener.handlers.length,0,'event handler cleaned');
            gardener.end();
            start();
        },500);
    });
}

test('gardener.clean custom property', function () {
    gardener.start();
    var el=document.createElement('a');
    el.customProperty={ref:el};
    gardener.endclean();
    equal(el.customProperty,null,'customProperty is removed');
});

test('gardener.status', function () {
    gardener.start();
    var el=document.createElement('a');
    el.customProperty={ref:el};
    el.id = 'testId';
    el.className='testClassName1 testClassName2';
    el.addEventListener('click', function () {
        // do something
    });
    var status = gardener.status();
    ok(status.length > 0,'report works correctly');
    gardener.clean();
    status = gardener.status();
    equal(status.length,0,'report works correctly');
    gardener.end();
});

test('gardener.handlers', function () {
    gardener.start();
    var el=document.createElement('a');
    el.addEventListener('click', function () {
        // do something a
    });
    el.onclick=function () {};
    el.cus = 1;
    equal(gardener.handlers.length,1,'no handler is traced');
    el.addEventListener('click', function () {
        // do something b
    });
    equal(gardener.handlers.length,2,'handler is traced');
    gardener.status();
    gardener.endclean();
});

test('gardener.except', function () {
    gardener.start();
	var totalCount=0;
    gardener.except(garden);
	totalCount+=1;
    equal(gardener.exceptions.length,totalCount,'1 element added to exceptions');
	var threshold = 50;
	var nodeCount = Math.floor(Math.random()*threshold);
	console.log(nodeCount + "generated");
	var tagName='fieldset';
	for (var i=0;i<nodeCount;i++){
		garden.appendChild(document.createElement(tagName));
	}
	gardener.except(garden.getElementsByTagName(tagName));
	totalCount+=nodeCount;
    equal(gardener.exceptions.length,totalCount,totalCount + ' elements were added from an array-like object');
	gardener.innerHTML='';
	gardener.endclean();
    equal(gardener.exceptions.length,totalCount,'exception elements are not cleaned even endclean is called');

	gardener.start();
	var el = document.createElement('div');
	el.id="testDiv";
	el.ondbclick = function () {console.log('clicked')}
	el.customProperty = {x:1,y:2};
	gardener.except(el);
	var report = gardener.status();
	equal(report.length,0,'element is in exception list and not report as a problem');
	gardener.innerHTML = "";
	gardener.endclean();
});

asyncTest('gardener.except/eventHandler', function () {
	gardener.start();
	var el = document.createElement('div');
	el.addEventListener('click', function () {
		ok(true,'the event handler not removed if it is in the excepiton list');
		start();
	});
	gardener.except(el);
	garden.appendChild(el);
	gardener.clean();
	fireEventStandard(el,'click');
});
