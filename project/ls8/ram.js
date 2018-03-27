/**
 * RAM access
 */
class RAM {
    constructor(size) {
        this.mem = new Array(size);
        this.mem.fill(0);
    }

    /**
     * Write (store) MDR(Memory Data Register) value at address MAR(Memory Addess Register)
     */
    write(MAR, MDR) {
        // write the value in the MDR to the address MAR
        this.mem[MAR] = MDR;
    }

    /**
     * Read (load) MDR value from address MAR
     *
     * @returns MDR
     */
    read(MAR) {
        // Read the value in address MAR and return it
        return this.mem[MAR];
    }
}

module.exports = RAM;
