/**
 * LS-8 v2.0 emulator skeleton code
 */
//Instructions
const HLT = 0b00000001;
const LDI = 0b10011001;
const PRN = 0b01000011;
const MUL = 0b10101010;
const POP = 0b01001100;
const PUSH = 0b01001101;
const CALL = 0b01001000;
const ADD = 0b10101000;
const RET = 0b00001001;
const CMP = 0b10100000;
const JMP = 0b01010000;
const JEQ = 0b01010001;
const JNE = 0b01010010;
let called = 0;
let SP = 7;
/**
 * Class for simulating a simple Computer (CPU & memory)
 */
class CPU {

    /**
     * Initialize the CPU
     */
    constructor(ram) {
        this.ram = ram;

        this.reg = new Array(8).fill(0); // General-purpose registers R0-R7

        // Special-purpose registers
        this.reg.PC = 0; // Program Counter
        this.reg[SP] = 0xF4;
        this.flags = {};
    }

    /**
     * Store value in memory address, useful for program loading
     */
    poke(address, value) {
        this.ram.write(address, value);
    }

    /**
     * Starts the clock ticking on the CPU
     */
    startClock() {
        const _this = this;

        this.clock = setInterval(() => {
            _this.tick();
        }, 1); // 1 ms delay == 1 KHz clock == 0.000001 GHz
    }

    /**
     * Stops the clock
     */
    stopClock() {
        clearInterval(this.clock);
    }

    /**
     * ALU functionality
     *
     * The ALU is responsible for math and comparisons.
     *
     * If you have an instruction that does math, i.e. MUL, the CPU would hand
     * it off to it's internal ALU component to do the actual work.
     *
     * op can be: ADD SUB MUL DIV INC DEC CMP
     */
    alu(op, regA, regB) {
        switch (op) {
            case 'MUL':
                this.reg[regA] = this.reg[regA] * this.reg[regB];
                break;
            case 'ADD':
                this.reg[regA] = this.reg[regA] + this.reg[regB];
                break;
            default:
                console.log('Unknown OP');
                break;
        }
    }

    push(regA) {
        this.reg[SP]--;
        this.ram.write(this.reg[SP], this.reg[regA]);
    }

    pop(regA) {
        this.reg[regA] = this.ram.read(this.reg[SP]);
        this.reg[SP]++;
    }

    /**
     * Advances the CPU one cycle
     */
    tick() {
        // Load the instruction register (IR--can just be a local variable here)
        // from the memory address pointed to by the PC. (I.e. the PC holds the
        // index into memory of the next instruction.)

        const IR = this.ram.read(this.reg.PC);

        // Debugging output
        // console.log(`${this.reg.PC}: ${IR.toString(2)}`);

        // Get the two bytes in memory _after_ the PC in case the instruction
        // needs them.

        const operandA = this.ram.read(this.reg.PC + 1);
        const operandB = this.ram.read(this.reg.PC + 2);

        // Execute the instruction. Perform the actions for the instruction as
        // outlined in the LS-8 spec.

        switch(IR) {
            case HLT:
                this.stopClock();
                break;
            case LDI:
                this.reg[operandA] = operandB;
                break;
            case PRN:
                console.log(this.reg[operandA]);
                break;
            case MUL:
                this.alu('MUL', operandA, operandB)
                break;
            case ADD:
                this.alu('ADD', operandA, operandB)
                break;
            case POP:
                this.pop(operandA);
                break;
            case PUSH:
                this.push(operandA);
                break;
            case CALL:
                called = 1;
                if (!operandA) {
                    this.reg.PC += (IR >>> 6) + 1;
                } else {
                    this.reg[SP]--;
                    this.ram.write(this.reg[SP], this.reg.PC + 2);
                    this.reg.PC = this.reg[operandA];
                }
                break;
            case RET:
                called = 1;
                this.reg.PC = this.ram.read(this.reg[SP]);
                this.reg[SP]++;
                break;
            case CMP:
                if (this.reg[operandA] === this.reg[operandB]) {
                    this.flags.E = 1;
                } else {
                    this.flags.E = 0;
                }
                break;
            case JMP:
                called = 1;
                this.reg.PC = this.reg[operandA];
                break;
            case JEQ:
                if (this.flags.E) {
                    called = 1;
                    this.reg.PC = this.reg[operandA];
                }
                break;
            case JNE:
                if (!this.flags.E) {
                    called = 1;
                    this.reg.PC = this.reg[operandA];
                }
                break;
            default:
                console.log("Unknown instruction" + IR.toString(2));
                this.stopClock();
                break;
        }

        // Increment the PC register to go to the next instruction. Instructions
        // can be 1, 2, or 3 bytes long. Hint: the high 2 bits of the
        // instruction byte tells you how many bytes follow the instruction byte
        // for any particular instruction.

        if (called) {
            called = 0;
        } else {
            this.reg.PC += (IR >>> 6) + 1;
        }
    }
}

module.exports = CPU;
