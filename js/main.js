/**
 * Main application — ties together scene, character, world, controls, and book reader.
 * Uses global THREE, Character, World, Controls, BookReader classes.
 */
(function () {
    var canvas = document.getElementById('game-canvas');
    var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    var scene = new THREE.Scene();

    var camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 150);
    var cameraOffset = new THREE.Vector3(0, 2.5, 4.0);
    var cameraLookOffset = new THREE.Vector3(0, 1.0, 0);

    var character = new Character();
    scene.add(character.getObject());
    character.getObject().position.set(0, 0, 3);

    var world = new World(scene);
    var controls = new Controls();
    var bookReader = new BookReader();
    var clock = new THREE.Clock();

    var moveSpeed = 3.5;
    var runSpeed = 6.0;
    var turnSpeed = 3.0;
    var characterDirection = 0;

    var currentCameraPos = new THREE.Vector3();
    var currentLookAt = new THREE.Vector3();
    var cameraInitialized = false;

    // Interact hint DOM element
    var interactHint = document.getElementById('interact-hint');

    window.addEventListener('resize', function () {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Hide loading screen
    var loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) loadingScreen.classList.add('hidden');

    function updateCharacter(delta) {
        // Don't move if reader is open
        if (bookReader.isOpen) return;

        var charObj = character.getObject();
        var isMoving = controls.forward || controls.backward;
        var isTurning = controls.left || controls.right;
        var isRunning = controls.sprint;

        if (controls.left) characterDirection += turnSpeed * delta;
        if (controls.right) characterDirection -= turnSpeed * delta;

        var speed = isRunning ? runSpeed : moveSpeed;
        var prevX = charObj.position.x;
        var prevZ = charObj.position.z;

        if (controls.forward) {
            charObj.position.x -= Math.sin(characterDirection) * speed * delta;
            charObj.position.z -= Math.cos(characterDirection) * speed * delta;
        }
        if (controls.backward) {
            charObj.position.x += Math.sin(characterDirection) * speed * delta * 0.5;
            charObj.position.z += Math.cos(characterDirection) * speed * delta * 0.5;
        }

        // Check collision — slide along walls
        if (world.checkCollision(charObj.position)) {
            var tryX = new THREE.Vector3(charObj.position.x, 0, prevZ);
            if (!world.checkCollision(tryX)) {
                charObj.position.z = prevZ;
            } else {
                var tryZ = new THREE.Vector3(prevX, 0, charObj.position.z);
                if (!world.checkCollision(tryZ)) {
                    charObj.position.x = prevX;
                } else {
                    charObj.position.x = prevX;
                    charObj.position.z = prevZ;
                }
            }
        }

        charObj.rotation.y = characterDirection;
        character.isMoving = isMoving || isTurning;
        character.isRunning = isRunning;
        character.update(delta);
    }

    function updateCamera(delta) {
        var charObj = character.getObject();
        var charPos = charObj.position;

        var desiredPos = new THREE.Vector3();
        desiredPos.x = charPos.x + Math.sin(characterDirection) * cameraOffset.z;
        desiredPos.y = charPos.y + cameraOffset.y;
        desiredPos.z = charPos.z + Math.cos(characterDirection) * cameraOffset.z;

        var desiredLookAt = new THREE.Vector3(
            charPos.x + cameraLookOffset.x,
            charPos.y + cameraLookOffset.y,
            charPos.z + cameraLookOffset.z
        );

        if (!cameraInitialized) {
            currentCameraPos.copy(desiredPos);
            currentLookAt.copy(desiredLookAt);
            cameraInitialized = true;
        }

        var smoothFactor = 1 - Math.pow(0.01, delta);
        currentCameraPos.lerp(desiredPos, smoothFactor);
        currentLookAt.lerp(desiredLookAt, smoothFactor);

        camera.position.copy(currentCameraPos);
        camera.lookAt(currentLookAt);
    }

    /**
     * Handle proximity to pedestals and book interaction.
     */
    function updateInteraction() {
        // If reader is open, handle escape
        if (bookReader.isOpen) {
            if (controls.consumeEscape()) {
                bookReader.close();
            }
            // Consume interact to avoid re-triggering
            controls.consumeInteract();
            // Hide the hint when reader is open
            if (interactHint) interactHint.classList.remove('visible');
            return;
        }

        var charPos = character.getObject().position;
        var nearbyPedestal = world.getNearbyPedestal(charPos);

        if (nearbyPedestal) {
            // Show interact hint
            if (interactHint) interactHint.classList.add('visible');

            // Check for R key press
            if (controls.consumeInteract()) {
                bookReader.open(nearbyPedestal.pdfPath);
            }
        } else {
            // Hide interact hint
            if (interactHint) interactHint.classList.remove('visible');
            controls.consumeInteract(); // consume even if not near
        }

        // Always consume escape if not in reader
        controls.consumeEscape();
    }

    function animate() {
        requestAnimationFrame(animate);
        var delta = Math.min(clock.getDelta(), 0.05);
        var elapsed = clock.elapsedTime;

        updateInteraction();
        updateCharacter(delta);
        updateCamera(delta);
        world.update(elapsed);
        world.updateLightTarget(character.getObject().position);

        renderer.render(scene, camera);
    }

    animate();
})();
