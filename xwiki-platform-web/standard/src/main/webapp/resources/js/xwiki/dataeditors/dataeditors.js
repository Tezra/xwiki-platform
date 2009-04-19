// ======================================
// Object editor enhancements
document.observe('dom:loaded', function() {
  // ------------------------------------
  // Ajax object deletion
  $$('#xwikiobjects a.delete').each(function(item) {
    item.observe('click', function(event) {
      item.blur();
      event.stop();
      if (confirm('Are you sure you want to delete this object? After the object is deleted, canceling the modifications will not restore deleted objects.')) {
        new Ajax.Request(item.href, {
          onSuccess : function() {
            var xobjectElement = item.up('.xobject');
            xobjectElement.parentNode.removeChild(xobjectElement);
          }
        });
      }
    }.bindAsEventListener());
  });
  // ------------------------------------
  // Edit button behavior
  $$('#xwikiobjects a.edit').each(function(item) {
    item.observe('click', function(event) {
      item.blur();
      event.stop();
      window.location = item.href;
    }.bindAsEventListener());
  });
  // ------------------------------------
  // Expand/collapse class properties (class editor),
  // classes and objects (object editor)
  $$('#xwikiobjects .xclass-title, .xproperty-title').each(function(item) {
    item.observe('click', function(event) {
      item.up().toggleClassName('collapsed');
    }.bindAsEventListener());
  });
  if ($$('.xproperty').size() > 1)
  $$('.xproperty').each(function(item) {
    item.addClassName('collapsable');
    item.toggleClassName('collapsed');
  });
  if ($$('#xwikiobjects .xobject').size() > 1)
  $$('#xwikiobjects .xobject').each(function(item) {
    item.addClassName('collapsable');
    item.toggleClassName('collapsed');
  });
  $$('#xwikiobjects .xclass').each(function(item) {
    item.addClassName('collapsable');
  });
  $$('#xwikiobjects .xobject-title').each(function(item) {
    item.observe('click', function(event) {
      item.up().toggleClassName('collapsed');
    }.bindAsEventListener());
  });
  // ------------------------------------
  // Allow to collapse object properties (object editor)
  // and property meta-properties (lass editor)
  $$('.xobject-content dt, .xproperty-content dt').each(function(item) {
    if(! item.down('input[type=checkbox]')) {
      item.addClassName('collapsable');
      item.insertBefore(new Element('span', {'class' : 'collapser'}), item.firstDescendant());  
    } else {
      item.addClassName('uncollapsable');
    }
  });
  $$('.xobject-content dt label, .xproperty-content dt label').each(function(item) {
    item.observe('click', function(event) {
      if(item.up('dt').down('span').hasClassName('collapsed')) {
        item.up('dt').next('dd').toggle();
        item.up('dt').down('span').toggleClassName('collapsed');
      }
    }.bindAsEventListener());
  });
  $$('.collapser').each(function(item) {
    item.observe('click', function(event) {
      item.up('dt').next('dd').toggle();
      item.toggleClassName('collapsed');
    }.bindAsEventListener());
  });
});

// ======================================
// Class editor, 'Move property' feature
if (typeof(XWiki) == 'undefined') {
  XWiki = new Object();
}

XWiki.XPropertyOrdering = Class.create({
  initialize : function() {
    // Hide the property number, as ordering can be done by drag and drop
    $$('.xproperty-content').each(function(item) {
      item.select("input").each(function(input) {
        if (input.id.endsWith("_number")) {
          item.numberProperty = input;
          input.up().hide();
          if (input.up().previous('dt')) {
            input.up().previous('dt').hide();
          }
        }
      });
    });
    // Create and insert move button
    $$('.xproperty-title').each(function(item) {
      var movebutton = new Element('img', {
        src: "$xwiki.getSkinFile('icons/datamodel/move.png')",
        'class': 'move',
        alt: 'move',
        title: 'Drag and drop to change the order'
      });
      item.makePositioned();
      item.appendChild(movebutton);
      movebutton.observe('click', function(event) {
        event.stop();
      }.bindAsEventListener());
    });
    // Attach behavior to the move buttons
    Sortable.create('xclassContent', {
      tag : 'div',
      only : 'xproperty',
      handle : 'move',
      starteffect : this.startDrag.bind(this),
      endeffect : this.endDrag.bind(this),
      onUpdate : this.updateOrder.bind(this)
    });
  },
  updateOrder : function(container) {
    var children = container.childElements();
    for (var i = 0; i < children.size(); ++i) {
      var child = children[i].down(".xproperty-content");
      child.numberProperty.value = i+1;
    }
  },
  startDrag : function(dragged) {
    dragged.addClassName('dragged');
    $('xclassContent').childElements().each(function(item) {
      item._expandedBeforeDrag = !item.hasClassName('collapsed');
      item.addClassName('collapsed');
    });
  },
  endDrag : function(dragged) {
    dragged.removeClassName('dragged');
    $('xclassContent').childElements().each(function(item) {
      if (item._expandedBeforeDrag) {
        item.removeClassName('collapsed');
      }
    });
  }
});

document.observe('dom:loaded', function() {
  if($('xclassContent')) {
    new XWiki.XPropertyOrdering();
  }
});