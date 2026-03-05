/**
 * Mobile touch controls — virtual joystick + interact button.
 * Only activates on touch-capable devices.
 */
class TouchControls {
    constructor(controls) {
        this.controls = controls;
        this.active = false;
        this.joystickActive = false;
        this.startX = 0;
        this.startY = 0;
        this.deltaX = 0;
        this.deltaY = 0;
        this.deadZone = 15;

        // Only init on touch devices
        if (!('ontouchstart' in window)) return;
        this.active = true;
        this.createUI();
        this.bindEvents();
    }

    createUI() {
        // --- Virtual Joystick (bottom-left) ---
        this.joystickContainer = document.createElement('div');
        this.joystickContainer.id = 'touch-joystick';
        this.joystickContainer.innerHTML = '<div class="joystick-base"><div class="joystick-knob"></div></div>';
        document.body.appendChild(this.joystickContainer);

        this.joystickBase = this.joystickContainer.querySelector('.joystick-base');
        this.joystickKnob = this.joystickContainer.querySelector('.joystick-knob');

        // --- Interact Button (bottom-right) ---
        this.interactBtn = document.createElement('div');
        this.interactBtn.id = 'touch-interact-btn';
        this.interactBtn.innerHTML = '<span>R</span>';
        this.interactBtn.style.display = 'none'; // shown only near pedestals
        document.body.appendChild(this.interactBtn);

        // --- Sprint Button (above interact) ---
        this.sprintBtn = document.createElement('div');
        this.sprintBtn.id = 'touch-sprint-btn';
        this.sprintBtn.innerHTML = '<span>Sprint</span>';
        document.body.appendChild(this.sprintBtn);

        // Inject styles
        var style = document.createElement('style');
        style.textContent = `
            #touch-joystick {
                position: fixed;
                bottom: 30px;
                left: 30px;
                z-index: 300;
                touch-action: none;
            }
            .joystick-base {
                width: 120px;
                height: 120px;
                border-radius: 50%;
                background: rgba(62, 42, 26, 0.4);
                border: 2px solid rgba(201, 168, 76, 0.35);
                display: flex;
                align-items: center;
                justify-content: center;
                position: relative;
            }
            .joystick-knob {
                width: 48px;
                height: 48px;
                border-radius: 50%;
                background: rgba(201, 168, 76, 0.6);
                border: 2px solid rgba(201, 168, 76, 0.8);
                box-shadow: 0 2px 10px rgba(0,0,0,0.3);
                position: absolute;
                transition: none;
            }
            #touch-interact-btn {
                position: fixed;
                bottom: 40px;
                right: 30px;
                z-index: 300;
                width: 64px;
                height: 64px;
                border-radius: 50%;
                background: rgba(201, 168, 76, 0.3);
                border: 2px solid rgba(201, 168, 76, 0.6);
                display: flex;
                align-items: center;
                justify-content: center;
                touch-action: none;
                cursor: pointer;
            }
            #touch-interact-btn span {
                color: #c9a84c;
                font-size: 1.4rem;
                font-weight: 700;
                font-family: 'EB Garamond', Georgia, serif;
            }
            #touch-interact-btn:active {
                background: rgba(201, 168, 76, 0.6);
                transform: scale(0.92);
            }
            #touch-sprint-btn {
                position: fixed;
                bottom: 120px;
                right: 30px;
                z-index: 300;
                width: 64px;
                height: 40px;
                border-radius: 20px;
                background: rgba(62, 42, 26, 0.4);
                border: 2px solid rgba(201, 168, 76, 0.25);
                display: flex;
                align-items: center;
                justify-content: center;
                touch-action: none;
                cursor: pointer;
            }
            #touch-sprint-btn.active {
                background: rgba(201, 168, 76, 0.4);
                border-color: rgba(201, 168, 76, 0.7);
            }
            #touch-sprint-btn span {
                color: rgba(201, 168, 76, 0.7);
                font-size: 0.7rem;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                font-family: 'EB Garamond', Georgia, serif;
            }
            /* Hide keyboard hint on mobile */
            @media (pointer: coarse) {
                #controls-hint { display: none !important; }
            }
        `;
        document.head.appendChild(style);
    }

    bindEvents() {
        var self = this;
        var baseRadius = 60;
        var knobRadius = 24;
        var maxMove = baseRadius - knobRadius;

        // --- Joystick touch ---
        this.joystickBase.addEventListener('touchstart', function (e) {
            e.preventDefault();
            self.joystickActive = true;
            var touch = e.touches[0];
            var rect = self.joystickBase.getBoundingClientRect();
            self.startX = rect.left + rect.width / 2;
            self.startY = rect.top + rect.height / 2;
            self.handleJoystickMove(touch.clientX, touch.clientY, maxMove);
        }, { passive: false });

        this.joystickBase.addEventListener('touchmove', function (e) {
            e.preventDefault();
            if (!self.joystickActive) return;
            var touch = e.touches[0];
            self.handleJoystickMove(touch.clientX, touch.clientY, maxMove);
        }, { passive: false });

        var resetJoystick = function () {
            self.joystickActive = false;
            self.deltaX = 0;
            self.deltaY = 0;
            self.joystickKnob.style.transform = 'translate(0px, 0px)';
            self.controls.keys.ArrowUp = false;
            self.controls.keys.ArrowDown = false;
            self.controls.keys.ArrowLeft = false;
            self.controls.keys.ArrowRight = false;
        };

        this.joystickBase.addEventListener('touchend', resetJoystick);
        this.joystickBase.addEventListener('touchcancel', resetJoystick);

        // --- Interact button ---
        this.interactBtn.addEventListener('touchstart', function (e) {
            e.preventDefault();
            self.controls._interactPressed = true;
            self.controls.keys.KeyR = true;
        }, { passive: false });

        this.interactBtn.addEventListener('touchend', function (e) {
            e.preventDefault();
            self.controls.keys.KeyR = false;
        }, { passive: false });

        // --- Sprint button (toggle) ---
        var sprinting = false;
        this.sprintBtn.addEventListener('touchstart', function (e) {
            e.preventDefault();
            sprinting = !sprinting;
            self.controls.keys.ShiftLeft = sprinting;
            self.sprintBtn.classList.toggle('active', sprinting);
        }, { passive: false });
    }

    handleJoystickMove(touchX, touchY, maxMove) {
        var dx = touchX - this.startX;
        var dy = touchY - this.startY;
        var dist = Math.sqrt(dx * dx + dy * dy);

        // Clamp to circular area
        if (dist > maxMove) {
            dx = (dx / dist) * maxMove;
            dy = (dy / dist) * maxMove;
        }

        this.deltaX = dx;
        this.deltaY = dy;

        // Move the knob visually
        this.joystickKnob.style.transform = 'translate(' + dx + 'px, ' + dy + 'px)';

        // Map to controls
        this.controls.keys.ArrowUp = dy < -this.deadZone;
        this.controls.keys.ArrowDown = dy > this.deadZone;
        this.controls.keys.ArrowLeft = dx < -this.deadZone;
        this.controls.keys.ArrowRight = dx > this.deadZone;
    }

    /**
     * Show/hide the interact button based on proximity.
     */
    showInteract(show) {
        if (!this.active) return;
        this.interactBtn.style.display = show ? 'flex' : 'none';
    }
}
