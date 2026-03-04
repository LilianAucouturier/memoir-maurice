/**
 * Creates a stylized humanoid character with a pencil-drawn / sketch look.
 * Uses the global THREE object (loaded via script tag).
 */
class Character {
    constructor() {
        this.group = new THREE.Group();
        this.walkTime = 0;
        this.isMoving = false;
        this.isRunning = false;

        // ========================================
        // PENCIL-SKETCH MATERIALS
        // Flat colors (no light reaction) + dark outlines
        // ========================================
        const sketchBody = new THREE.MeshBasicMaterial({ color: 0x5c4b3a });
        const sketchSkin = new THREE.MeshBasicMaterial({ color: 0xe8d5b7 });
        const sketchShoe = new THREE.MeshBasicMaterial({ color: 0x2a1f14 });
        const sketchPants = new THREE.MeshBasicMaterial({ color: 0x3e3224 });
        const sketchHair = new THREE.MeshBasicMaterial({ color: 0x1a0e08 });
        const sketchEye = new THREE.MeshBasicMaterial({ color: 0x111111 });
        const outlineMat = new THREE.MeshBasicMaterial({ color: 0x1a0e08, side: THREE.BackSide });

        // Helper: create mesh + black outline shell
        const createSketchMesh = (geometry, material, outlineScale) => {
            outlineScale = outlineScale || 1.12;
            const mesh = new THREE.Mesh(geometry, material);

            // Outline: slightly bigger copy rendered from the back
            const outlineGeo = geometry.clone();
            const outline = new THREE.Mesh(outlineGeo, outlineMat);
            outline.scale.multiplyScalar(outlineScale);
            mesh.add(outline);

            return mesh;
        };

        // --- Head ---
        const headGeo = new THREE.SphereGeometry(0.22, 16, 16);
        this.head = createSketchMesh(headGeo, sketchSkin, 1.1);
        this.head.position.y = 1.55;
        this.head.castShadow = true;
        this.group.add(this.head);

        // Hair
        const hairGeo = new THREE.SphereGeometry(0.235, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.6);
        const hair = createSketchMesh(hairGeo, sketchHair, 1.08);
        hair.position.y = 1.57;
        hair.castShadow = true;
        this.group.add(hair);

        // Eyes
        const eyeGeo = new THREE.SphereGeometry(0.035, 8, 8);
        const leftEye = new THREE.Mesh(eyeGeo, sketchEye);
        leftEye.position.set(-0.08, 1.57, 0.19);
        this.group.add(leftEye);
        const rightEye = new THREE.Mesh(eyeGeo, sketchEye);
        rightEye.position.set(0.08, 1.57, 0.19);
        this.group.add(rightEye);

        // --- Torso ---
        const torsoGeo = new THREE.CapsuleGeometry(0.17, 0.35, 8, 16);
        const torso = createSketchMesh(torsoGeo, sketchBody, 1.08);
        torso.position.y = 1.15;
        torso.castShadow = true;
        this.group.add(torso);

        // --- Arms ---
        const armGeo = new THREE.CapsuleGeometry(0.055, 0.3, 6, 12);

        this.leftArmPivot = new THREE.Group();
        this.leftArmPivot.position.set(-0.25, 1.3, 0);
        const leftArm = createSketchMesh(armGeo, sketchSkin, 1.15);
        leftArm.position.y = -0.2;
        leftArm.castShadow = true;
        this.leftArmPivot.add(leftArm);
        this.group.add(this.leftArmPivot);

        this.rightArmPivot = new THREE.Group();
        this.rightArmPivot.position.set(0.25, 1.3, 0);
        const rightArm = createSketchMesh(armGeo, sketchSkin, 1.15);
        rightArm.position.y = -0.2;
        rightArm.castShadow = true;
        this.rightArmPivot.add(rightArm);
        this.group.add(this.rightArmPivot);

        // --- Legs ---
        const legGeo = new THREE.CapsuleGeometry(0.07, 0.32, 6, 12);

        this.leftLegPivot = new THREE.Group();
        this.leftLegPivot.position.set(-0.1, 0.78, 0);
        const leftLeg = createSketchMesh(legGeo, sketchPants, 1.12);
        leftLeg.position.y = -0.22;
        leftLeg.castShadow = true;
        this.leftLegPivot.add(leftLeg);
        this.group.add(this.leftLegPivot);

        this.rightLegPivot = new THREE.Group();
        this.rightLegPivot.position.set(0.1, 0.78, 0);
        const rightLeg = createSketchMesh(legGeo, sketchPants, 1.12);
        rightLeg.position.y = -0.22;
        rightLeg.castShadow = true;
        this.rightLegPivot.add(rightLeg);
        this.group.add(this.rightLegPivot);

        // --- Feet ---
        const footGeo = new THREE.BoxGeometry(0.12, 0.06, 0.2);
        footGeo.translate(0, 0, 0.03);

        const leftFoot = createSketchMesh(footGeo, sketchShoe, 1.15);
        leftFoot.position.y = -0.4;
        leftFoot.castShadow = true;
        this.leftLegPivot.add(leftFoot);

        const rightFoot = createSketchMesh(footGeo, sketchShoe, 1.15);
        rightFoot.position.y = -0.4;
        rightFoot.castShadow = true;
        this.rightLegPivot.add(rightFoot);

        // Shadow
        this.group.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });

        // Movement state
        this.velocity = new THREE.Vector3();
        this.rotation = 0;
        this.group.position.y = 0;
    }

    update(deltaTime) {
        if (this.isMoving) {
            const speed = this.isRunning ? 12 : 7;
            this.walkTime += deltaTime * speed;

            const swingAngle = this.isRunning ? 0.7 : 0.45;

            this.leftLegPivot.rotation.x = Math.sin(this.walkTime) * swingAngle;
            this.rightLegPivot.rotation.x = Math.sin(this.walkTime + Math.PI) * swingAngle;

            this.leftArmPivot.rotation.x = Math.sin(this.walkTime + Math.PI) * swingAngle * 0.6;
            this.rightArmPivot.rotation.x = Math.sin(this.walkTime) * swingAngle * 0.6;

            this.head.position.y = 1.55 + Math.sin(this.walkTime * 2) * 0.015;
            this.group.position.y = Math.abs(Math.sin(this.walkTime)) * 0.03;
        } else {
            this.walkTime = 0;
            this.leftLegPivot.rotation.x *= 0.85;
            this.rightLegPivot.rotation.x *= 0.85;
            this.leftArmPivot.rotation.x *= 0.85;
            this.rightArmPivot.rotation.x *= 0.85;
            this.head.position.y += (1.55 - this.head.position.y) * 0.1;
            this.group.position.y *= 0.85;

            const breath = Math.sin(Date.now() * 0.003) * 0.005;
            this.group.position.y += breath;
        }
    }

    getObject() {
        return this.group;
    }
}
