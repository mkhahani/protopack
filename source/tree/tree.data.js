/**
 * Protopack Tree Data is a class for manipulating tree-structred data
 *
 * @author      Mohsen Khahani <mkhahani@gmail.com>
 * @copyright   2013 Mohsen Khahani
 * @license     MIT
 * @version     1.0
 * @created     July 20, 2013
 * @url         http://mohsenkhahani.ir/protopack
 *
 * @dependency
 *    - Prototype JS framework v1.7+
 */


/**
 * Protopack Tree Data class
 */
Protopack.Tree.Data = Class.create({

    /**
     * Tree data initializer
     *
     * @access  private
     * @param   string  id      Node's ID
     * @param   string  pid     Node's parent
     * @param   string  text    Node's text
     * @param   mixed   extra   Node's extra data (optional)
     * @return  Object  A class instance of Tree Data
     */
    initialize: function (id, pid, text, extra) {
        this.id = id;
        this.pid = pid;
        this.text = text;
        this.extra = extra || {};
        this.childs = [];
    },

    getNode: function(id) {
        if (this.id == id) {
            return this;
        }

        var res = false;
        this.childs.each(function(child) {
            if (child.id == id) {
                res = child;
                throw $break;
            }
        });

        if (res === false) {
            this.childs.each(function(child) {
                res = child.getNode(id);
                if (res) {
                    throw $break;
                }
            });
        }

        return res;
    },

    addNode: function(id, pid, text, extra) {
        var parent = this.getNode(pid),
            node = new Protopack.Tree.Data(id, pid, text, extra);
        parent.childs.push(node);
        return node;
    },

    getChildren: function(deep) {
        var childs = this.childs.clone();
        if (deep) {
            this.childs.each(function(child) {
                var grandchilds = child.getChildren(true);
                childs = childs.concat(grandchilds);
            });
        }
        return childs;
    }
});
