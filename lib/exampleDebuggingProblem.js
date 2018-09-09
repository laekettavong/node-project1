/*
* Library that demonstrates something throwning when it's init() is invoked
*/

// Constain for the moduel


const example = class {
    static init() {
        // This is an error created intentionally (bar is not defined)
        let foo = bar;
    }
}


module.exports = example;
