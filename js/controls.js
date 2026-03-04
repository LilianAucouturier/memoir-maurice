/**
 * Keyboard input handler for character movement.
 * No module imports needed.
 */
class Controls {
    constructor() {
        this.keys = {
            ArrowUp: false,
            ArrowDown: false,
            ArrowLeft: false,
            ArrowRight: false,
            ShiftLeft: false,
            ShiftRight: false
        };
        this.firstInput = false;
        window.addEventListener('keydown', (e) => this.onKeyDown(e));
        window.addEventListener('keyup', (e) => this.onKeyUp(e));
    }

    onKeyDown(e) {
        if (e.code in this.keys) {
            this.keys[e.code] = true;
            e.preventDefault();
            if (!this.firstInput) {
                this.firstInput = true;
                this.hideHint();
            }
        }
    }

    onKeyUp(e) {
        if (e.code in this.keys) {
            this.keys[e.code] = false;
            e.preventDefault();
        }
    }

    hideHint() {
        var hint = document.querySelector('.hint-box');
        if (hint) {
            hint.classList.add('fade-out');
            setTimeout(function () {
                var container = document.getElementById('controls-hint');
                if (container) container.style.display = 'none';
            }, 2000);
        }
    }

    get forward() { return this.keys.ArrowUp; }
    get backward() { return this.keys.ArrowDown; }
    get left() { return this.keys.ArrowLeft; }
    get right() { return this.keys.ArrowRight; }
    get sprint() { return this.keys.ShiftLeft || this.keys.ShiftRight; }
    get isMoving() { return this.forward || this.backward || this.left || this.right; }
}
