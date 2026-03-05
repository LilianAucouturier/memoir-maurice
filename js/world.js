/**
 * Creates a museum-style building with a hall and 3 rooms.
 * Each room has unique themed textures.
 * Uses the global THREE object.
 */
class World {
    constructor(scene) {
        this.scene = scene;
        this.colliders = [];
        this.roomLabels = [];
        this.textureLoader = new THREE.TextureLoader();
        this.build();
    }

    /**
     * Load a texture with tiling settings.
     */
    loadTexture(path, repeatX, repeatY) {
        var tex = this.textureLoader.load(path);
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(repeatX || 1, repeatY || 1);
        tex.colorSpace = THREE.SRGBColorSpace;
        return tex;
    }

    createWall(width, height, depth, x, y, z, material) {
        var geo = new THREE.BoxGeometry(width, height, depth);
        var mesh = new THREE.Mesh(geo, material);
        mesh.position.set(x, y, z);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        this.scene.add(mesh);
        var box = new THREE.Box3().setFromObject(mesh);
        this.colliders.push(box);
        return mesh;
    }

    createFloor(width, depth, x, z, material) {
        var geo = new THREE.PlaneGeometry(width, depth);
        var mesh = new THREE.Mesh(geo, material);
        mesh.rotation.x = -Math.PI / 2;
        mesh.position.set(x, 0.001, z);
        mesh.receiveShadow = true;
        this.scene.add(mesh);
        return mesh;
    }

    createCeiling(width, depth, x, z, material, height) {
        var geo = new THREE.PlaneGeometry(width, depth);
        var mesh = new THREE.Mesh(geo, material);
        mesh.rotation.x = Math.PI / 2;
        mesh.position.set(x, height, z);
        mesh.receiveShadow = true;
        this.scene.add(mesh);
        return mesh;
    }

    createLabel(text, x, y, z, fontSize) {
        fontSize = fontSize || 42;
        var canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 256;
        var ctx = canvas.getContext('2d');
        ctx.fillStyle = 'rgba(255,255,255,0)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.font = 'bold ' + fontSize + 'px "Segoe UI", system-ui, sans-serif';
        ctx.fillStyle = 'rgba(255,255,255,0.85)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        // Text shadow
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 6;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        ctx.fillText(text, canvas.width / 2, canvas.height / 2);
        var texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;
        var spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: true });
        var sprite = new THREE.Sprite(spriteMat);
        sprite.position.set(x, y, z);
        sprite.scale.set(4, 1, 1);
        this.scene.add(sprite);
        this.roomLabels.push(sprite);
        return sprite;
    }

    createSubLabel(text, x, y, z) {
        var canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 128;
        var ctx = canvas.getContext('2d');
        ctx.fillStyle = 'rgba(255,255,255,0)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.font = '300 28px "Segoe UI", system-ui, sans-serif';
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(0,0,0,0.4)';
        ctx.shadowBlur = 4;
        ctx.fillText(text, canvas.width / 2, canvas.height / 2);
        var texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;
        var spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: true });
        var sprite = new THREE.Sprite(spriteMat);
        sprite.position.set(x, y, z);
        sprite.scale.set(3.5, 0.45, 1);
        this.scene.add(sprite);
        this.roomLabels.push(sprite);
        return sprite;
    }

    build() {
        // ==========================================
        // LOAD TEXTURES
        // ==========================================
        var hallWallTex = this.loadTexture('assets/hall_wall.png', 2, 1);
        var hallFloorTex = this.loadTexture('assets/hall_floor.png', 3, 2.5);
        var r1WallTex = this.loadTexture('assets/room1_wall.png', 2, 1);
        var r1FloorTex = this.loadTexture('assets/room1_floor.png', 2, 2);
        var r2WallTex = this.loadTexture('assets/room2_wall.png', 2, 1);
        var r2FloorTex = this.loadTexture('assets/room2_floor.png', 2, 2);
        var r3WallTex = this.loadTexture('assets/room3_wall.png', 2, 1);
        var r3FloorTex = this.loadTexture('assets/room3_floor.png', 2, 2);

        // ==========================================
        // MATERIALS (textured)
        // ==========================================
        var hallWallMat = new THREE.MeshStandardMaterial({ map: hallWallTex, roughness: 0.85, metalness: 0.0, side: THREE.DoubleSide });
        var hallFloorMat = new THREE.MeshStandardMaterial({ map: hallFloorTex, roughness: 0.9, metalness: 0.0 });

        var r1WallMat = new THREE.MeshStandardMaterial({ map: r1WallTex, roughness: 0.9, metalness: 0.0, side: THREE.DoubleSide });
        var r1FloorMat = new THREE.MeshStandardMaterial({ map: r1FloorTex, roughness: 0.95, metalness: 0.0 });

        var r2WallMat = new THREE.MeshStandardMaterial({ map: r2WallTex, roughness: 0.7, metalness: 0.05, side: THREE.DoubleSide });
        var r2FloorMat = new THREE.MeshStandardMaterial({ map: r2FloorTex, roughness: 0.6, metalness: 0.05 });

        var r3WallMat = new THREE.MeshStandardMaterial({ map: r3WallTex, roughness: 0.95, metalness: 0.0, side: THREE.DoubleSide });
        var r3FloorMat = new THREE.MeshStandardMaterial({ map: r3FloorTex, roughness: 0.95, metalness: 0.0 });

        var ceilingMat = new THREE.MeshStandardMaterial({ color: 0xf5f0e8, roughness: 0.9, metalness: 0.0 });
        var accentMat = new THREE.MeshStandardMaterial({ color: 0x8b7355, roughness: 0.6, metalness: 0.1 });

        // ==========================================
        // SCENE SETUP
        // ==========================================
        this.scene.background = new THREE.Color(0xf5f0e8);
        this.scene.fog = new THREE.Fog(0xf5f0e8, 15, 50);

        var wallH = 4;
        var wallT = 0.25;
        var hallW = 12;
        var hallD = 10;
        var roomW = 8;
        var roomD = 8;
        var doorW = 2.2;

        // ==========================================
        // HALL D'ENTRÉE — Colonial plaster
        // ==========================================
        this.createFloor(hallW, hallD, 0, 0, hallFloorMat);
        this.createCeiling(hallW, hallD, 0, 0, ceilingMat, wallH);

        var hallBackWallLeftW = hallW / 2 - doorW / 2;
        this.createWall(hallBackWallLeftW, wallH, wallT, -(hallW / 2 - hallBackWallLeftW / 2), wallH / 2, -hallD / 2, hallWallMat);
        this.createWall(hallBackWallLeftW, wallH, wallT, (hallW / 2 - hallBackWallLeftW / 2), wallH / 2, -hallD / 2, hallWallMat);

        var hallSideWallTopD = hallD / 2 - doorW / 2;
        this.createWall(wallT, wallH, hallSideWallTopD, -hallW / 2, wallH / 2, -(hallD / 2 - hallSideWallTopD / 2), hallWallMat);
        this.createWall(wallT, wallH, hallSideWallTopD, -hallW / 2, wallH / 2, (hallD / 2 - hallSideWallTopD / 2), hallWallMat);
        this.createWall(wallT, wallH, hallSideWallTopD, hallW / 2, wallH / 2, -(hallD / 2 - hallSideWallTopD / 2), hallWallMat);
        this.createWall(wallT, wallH, hallSideWallTopD, hallW / 2, wallH / 2, (hallD / 2 - hallSideWallTopD / 2), hallWallMat);

        this.createWall(hallBackWallLeftW, wallH, wallT, -(hallW / 2 - hallBackWallLeftW / 2), wallH / 2, hallD / 2, hallWallMat);
        this.createWall(hallBackWallLeftW, wallH, wallT, (hallW / 2 - hallBackWallLeftW / 2), wallH / 2, hallD / 2, hallWallMat);

        this.createLabel("Hall d'entrée", 0, 3.2, 0);
        this.createSubLabel("Ouverture", 0, 2.7, 0);

        // ==========================================
        // SALLE 1 — Port-Louis cobblestone
        // ==========================================
        var s1cx = 0;
        var s1cz = -hallD / 2 - roomD / 2;

        this.createFloor(roomW, roomD, s1cx, s1cz, r1FloorMat);
        this.createCeiling(roomW, roomD, s1cx, s1cz, ceilingMat, wallH);
        this.createWall(roomW, wallH, wallT, s1cx, wallH / 2, s1cz - roomD / 2, r1WallMat);
        this.createWall(wallT, wallH, roomD, s1cx - roomW / 2, wallH / 2, s1cz, r1WallMat);
        this.createWall(wallT, wallH, roomD, s1cx + roomW / 2, wallH / 2, s1cz, r1WallMat);

        this.createLabel("Salle 1", s1cx, 3.2, s1cz);
        this.createSubLabel("Architectes du Mythe", s1cx, 2.7, s1cz);

        // ==========================================
        // SALLE 2 — Colonial wooden varangue
        // ==========================================
        var s2cx = -hallW / 2 - roomD / 2;
        var s2cz = 0;

        this.createFloor(roomD, roomW, s2cx, s2cz, r2FloorMat);
        this.createCeiling(roomD, roomW, s2cx, s2cz, ceilingMat, wallH);
        this.createWall(wallT, wallH, roomW, s2cx - roomD / 2, wallH / 2, s2cz, r2WallMat);
        this.createWall(roomD, wallH, wallT, s2cx, wallH / 2, s2cz - roomW / 2, r2WallMat);
        this.createWall(roomD, wallH, wallT, s2cx, wallH / 2, s2cz + roomW / 2, r2WallMat);

        this.createLabel("Salle 2", s2cx, 3.2, s2cz);
        this.createSubLabel("L'Archipel des Voix", s2cx, 2.7, s2cz);

        // ==========================================
        // SALLE 3 — Sugar estate / botanical
        // ==========================================
        var s3cx = hallW / 2 + roomD / 2;
        var s3cz = 0;

        this.createFloor(roomD, roomW, s3cx, s3cz, r3FloorMat);
        this.createCeiling(roomD, roomW, s3cx, s3cz, ceilingMat, wallH);
        this.createWall(wallT, wallH, roomW, s3cx + roomD / 2, wallH / 2, s3cz, r3WallMat);
        this.createWall(roomD, wallH, wallT, s3cx, wallH / 2, s3cz - roomW / 2, r3WallMat);
        this.createWall(roomD, wallH, wallT, s3cx, wallH / 2, s3cz + roomW / 2, r3WallMat);

        this.createLabel("Salle 3", s3cx, 3.2, s3cz);
        this.createSubLabel("Le Corps de l'Île", s3cx, 2.7, s3cz);

        // ==========================================
        // EXTERIOR — warm earth tone ground
        // ==========================================
        var extGeo = new THREE.PlaneGeometry(200, 200);
        var extMat = new THREE.MeshStandardMaterial({ color: 0xe8dcc8, roughness: 0.95, metalness: 0.0 });
        var extFloor = new THREE.Mesh(extGeo, extMat);
        extFloor.rotation.x = -Math.PI / 2;
        extFloor.position.y = -0.01;
        extFloor.receiveShadow = true;
        this.scene.add(extFloor);

        // ==========================================
        // LIGHTING — warm, colonial atmosphere
        // ==========================================
        var ambient = new THREE.AmbientLight(0xfff5e6, 0.55);
        this.scene.add(ambient);

        var dirLight = new THREE.DirectionalLight(0xffeedd, 1.0);
        dirLight.position.set(8, 18, 8);
        dirLight.castShadow = true;
        dirLight.shadow.mapSize.width = 2048;
        dirLight.shadow.mapSize.height = 2048;
        dirLight.shadow.camera.near = 0.5;
        dirLight.shadow.camera.far = 60;
        dirLight.shadow.camera.left = -25;
        dirLight.shadow.camera.right = 25;
        dirLight.shadow.camera.top = 25;
        dirLight.shadow.camera.bottom = -25;
        dirLight.shadow.bias = -0.001;
        this.scene.add(dirLight);
        this.dirLight = dirLight;

        var hemiLight = new THREE.HemisphereLight(0xfff5e6, 0xd4c4a8, 0.5);
        this.scene.add(hemiLight);

        // Room point lights with warm tones
        var hallLight = new THREE.PointLight(0xfff0d5, 0.8, 15);
        hallLight.position.set(0, 3.5, 0);
        this.scene.add(hallLight);

        var s1Light = new THREE.PointLight(0xffe8c8, 0.7, 12);
        s1Light.position.set(s1cx, 3.5, s1cz);
        this.scene.add(s1Light);

        var s2Light = new THREE.PointLight(0xffeedd, 0.7, 12);
        s2Light.position.set(s2cx, 3.5, s2cz);
        this.scene.add(s2Light);

        var s3Light = new THREE.PointLight(0xeeffdd, 0.6, 12);
        s3Light.position.set(s3cx, 3.5, s3cz);
        this.scene.add(s3Light);

        // Door frames in warm wood tone
        this.createDoorFrame(0, wallH, -hallD / 2, 'z', doorW, accentMat);
        this.createDoorFrame(-hallW / 2, wallH, 0, 'x', doorW, accentMat);
        this.createDoorFrame(hallW / 2, wallH, 0, 'x', doorW, accentMat);
        this.createDoorFrame(0, wallH, hallD / 2, 'z', doorW, accentMat);

        // ==========================================
        // PEDESTALS WITH GRIMOIRES
        // ==========================================
        this.createPedestalWithGrimoire(0, 0, 'assets/memoire.pdf');           // Hall
        this.createPedestalWithGrimoire(s1cx, s1cz, 'assets/memoire.pdf');     // Salle 1
        this.createPedestalWithGrimoire(s2cx, s2cz, 'assets/memoire.pdf');     // Salle 2
        this.createPedestalWithGrimoire(s3cx, s3cz, 'assets/memoire.pdf');     // Salle 3
    }

    createDoorFrame(x, wallH, z, axis, doorW, material) {
        var lintelH = 0.15;
        var lintelY = wallH - 0.3;
        if (axis === 'z') {
            var geo = new THREE.BoxGeometry(doorW + 0.3, lintelH, 0.3);
            var mesh = new THREE.Mesh(geo, material);
            mesh.position.set(x, lintelY, z);
            this.scene.add(mesh);
        } else {
            var geo2 = new THREE.BoxGeometry(0.3, lintelH, doorW + 0.3);
            var mesh2 = new THREE.Mesh(geo2, material);
            mesh2.position.set(x, lintelY, z);
            this.scene.add(mesh2);
        }
    }

    /**
     * Create a wooden pedestal with a closed grimoire laying flat on top.
     */
    createPedestalWithGrimoire(x, z, pdfPath) {
        var pedestalGroup = new THREE.Group();
        pedestalGroup.position.set(x, 0, z);

        // --- Pedestal column ---
        var pedestalMat = new THREE.MeshStandardMaterial({ color: 0x5c3d2e, roughness: 0.85, metalness: 0.05 });
        var pedestalGeo = new THREE.BoxGeometry(0.45, 1.0, 0.45);
        var pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
        pedestal.position.y = 0.5;
        pedestal.castShadow = true;
        pedestal.receiveShadow = true;
        pedestalGroup.add(pedestal);

        // --- Top plate ---
        var topMat = new THREE.MeshStandardMaterial({ color: 0x3e2a1a, roughness: 0.7, metalness: 0.1 });
        var topGeo = new THREE.BoxGeometry(0.55, 0.06, 0.55);
        var top = new THREE.Mesh(topGeo, topMat);
        top.position.y = 1.03;
        top.castShadow = true;
        pedestalGroup.add(top);

        // --- Base molding ---
        var baseGeo = new THREE.BoxGeometry(0.55, 0.08, 0.55);
        var base = new THREE.Mesh(baseGeo, pedestalMat);
        base.position.y = 0.04;
        base.castShadow = true;
        pedestalGroup.add(base);

        // --- Closed Grimoire (laying flat on the pedestal) ---
        var bookGroup = new THREE.Group();
        // Position the book right on top of the plate (plate top is at y=1.06)
        bookGroup.position.y = 1.06;

        // Book dimensions
        var bookW = 0.35; // width
        var bookD = 0.25; // depth
        var bookH = 0.05; // thickness

        // Cover material: worn brown leather
        var coverMat = new THREE.MeshStandardMaterial({ color: 0x6b3a2a, roughness: 0.95, metalness: 0.0 });
        var coverDarkMat = new THREE.MeshStandardMaterial({ color: 0x4a2518, roughness: 0.9, metalness: 0.02 });
        // Page material: old yellowed paper
        var pageMat = new THREE.MeshStandardMaterial({ color: 0xf0e6c8, roughness: 0.9, metalness: 0.0 });
        // Spine detail
        var spineMat = new THREE.MeshStandardMaterial({ color: 0x3e1a0e, roughness: 0.8, metalness: 0.05 });
        // Gold detail for title
        var goldMat = new THREE.MeshStandardMaterial({ color: 0xc9a84c, roughness: 0.4, metalness: 0.6 });

        // -- Main book body (pages block) --
        var pagesGeo = new THREE.BoxGeometry(bookW - 0.02, bookH - 0.015, bookD - 0.02);
        var pages = new THREE.Mesh(pagesGeo, pageMat);
        pages.position.y = bookH / 2;
        pages.castShadow = true;
        pages.receiveShadow = true;
        bookGroup.add(pages);

        // -- Bottom cover --
        var coverGeo = new THREE.BoxGeometry(bookW, 0.006, bookD);
        var bottomCover = new THREE.Mesh(coverGeo, coverMat);
        bottomCover.position.y = 0.003;
        bottomCover.castShadow = true;
        bottomCover.receiveShadow = true;
        bookGroup.add(bottomCover);

        // -- Top cover --
        var topCover = new THREE.Mesh(coverGeo, coverMat);
        topCover.position.y = bookH - 0.003;
        topCover.castShadow = true;
        topCover.receiveShadow = true;
        bookGroup.add(topCover);

        // -- Spine (left edge) --
        var spineGeo = new THREE.BoxGeometry(0.012, bookH + 0.004, bookD + 0.004);
        var spine = new THREE.Mesh(spineGeo, spineMat);
        spine.position.set(-bookW / 2 + 0.006, bookH / 2, 0);
        spine.castShadow = true;
        bookGroup.add(spine);

        // -- Gold title decoration on top cover --
        var titleGeo = new THREE.BoxGeometry(bookW * 0.5, 0.002, 0.015);
        var title = new THREE.Mesh(titleGeo, goldMat);
        title.position.set(0.02, bookH + 0.001, 0);
        bookGroup.add(title);

        // -- Gold border line on top cover --
        var borderGeo = new THREE.BoxGeometry(bookW * 0.7, 0.002, 0.004);
        var border1 = new THREE.Mesh(borderGeo, goldMat);
        border1.position.set(0.02, bookH + 0.001, bookD * 0.3);
        bookGroup.add(border1);
        var border2 = new THREE.Mesh(borderGeo, goldMat);
        border2.position.set(0.02, bookH + 0.001, -bookD * 0.3);
        bookGroup.add(border2);

        // -- Corner gold details --
        var cornerGeo = new THREE.BoxGeometry(0.02, 0.003, 0.02);
        var corners = [
            [bookW / 2 - 0.02, bookH + 0.001, bookD / 2 - 0.02],
            [bookW / 2 - 0.02, bookH + 0.001, -bookD / 2 + 0.02],
            [-bookW / 2 + 0.03, bookH + 0.001, bookD / 2 - 0.02],
            [-bookW / 2 + 0.03, bookH + 0.001, -bookD / 2 + 0.02]
        ];
        for (var c = 0; c < corners.length; c++) {
            var corner = new THREE.Mesh(cornerGeo, goldMat);
            corner.position.set(corners[c][0], corners[c][1], corners[c][2]);
            bookGroup.add(corner);
        }

        pedestalGroup.add(bookGroup);
        this.scene.add(pedestalGroup);

        // Store pedestal info for proximity detection
        this.pedestalPositions = this.pedestalPositions || [];
        this.pedestalPositions.push({
            x: x,
            z: z,
            pdfPath: pdfPath || null
        });

        // Add the pedestal as a collider so the player walks around it
        var pedestalBox = new THREE.Box3().setFromCenterAndSize(
            new THREE.Vector3(x, 0.5, z),
            new THREE.Vector3(0.7, 2, 0.7)
        );
        this.colliders.push(pedestalBox);
    }

    checkCollision(position, radius) {
        radius = radius || 0.35;
        var playerBox = new THREE.Box3(
            new THREE.Vector3(position.x - radius, 0, position.z - radius),
            new THREE.Vector3(position.x + radius, 2, position.z + radius)
        );
        for (var i = 0; i < this.colliders.length; i++) {
            if (playerBox.intersectsBox(this.colliders[i])) {
                return true;
            }
        }
        return false;
    }

    update(time) {
        // Books are static on pedestals — no animation needed
    }

    /**
     * Check if a position is near any pedestal. Returns the pedestal info or null.
     */
    getNearbyPedestal(position, maxDistance) {
        maxDistance = maxDistance || 2.0;
        if (!this.pedestalPositions) return null;
        for (var i = 0; i < this.pedestalPositions.length; i++) {
            var p = this.pedestalPositions[i];
            var dx = position.x - p.x;
            var dz = position.z - p.z;
            var dist = Math.sqrt(dx * dx + dz * dz);
            if (dist < maxDistance) {
                return p;
            }
        }
        return null;
    }

    updateLightTarget(playerPos) {
        this.dirLight.position.set(playerPos.x + 8, 18, playerPos.z + 8);
        this.dirLight.target.position.copy(playerPos);
        this.dirLight.target.updateMatrixWorld();
    }
}
