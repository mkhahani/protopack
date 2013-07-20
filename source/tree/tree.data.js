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
     * @param   mixed   data    Node's extra data (optional)
     * @return  Object  A class instance of Tree Data
     */
    initialize: function (id, pid, text, data) {
        this.id = id;
        this.pid = pid;
        this.text = text;
        this.data = data || null;
        this.nodes = [];
    },

    addNode: function(id, pid, text, data) {
        var parent = this.getNode(pid),
            node = new Protopack.Tree.Data(id, pid, text, data);
        parent.nodes.push(node);
        return node;
    },

    getNode: function(id) {
        if (this.id == id) {
            return this;
        }

        var res = false;
        this.nodes.each(function(node) {
            if (node.id == id) {
                res = node;
                throw $break;
            }
        });

        if (res === false) {
            this.nodes.each(function(node) {
                res = node.getNode(id);
                if (res) {
                    throw $break;
                }
            });
        }

        return res;
    },

    getNodes: function(recursive) {
        var nodes = this.nodes.clone();
        if (recursive) {
            this.nodes.each(function(node) {
                var res = node.getNodes(true);
                nodes = nodes.concat(res);
                // res.each(function(r) {
                    // nodes.push(r);
                // });
            });
        }
        return nodes;
    }
});
