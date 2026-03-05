/**
 * BookReader — Full-screen overlay to read a PDF as an open book.
 * Uses pdf.js (loaded via CDN) to render PDF pages onto canvases.
 */
class BookReader {
    constructor() {
        this.isOpen = false;
        this.pdfDoc = null;
        this.currentPage = 1;
        this.totalPages = 0;
        this.scale = 1.5;
        this.rendering = false;

        // DOM references
        this.overlay = document.getElementById('book-reader-overlay');
        this.leftCanvas = document.getElementById('book-page-left');
        this.rightCanvas = document.getElementById('book-page-right');
        this.leftCtx = this.leftCanvas.getContext('2d');
        this.rightCtx = this.rightCanvas.getContext('2d');
        this.pageInfo = document.getElementById('book-page-info');
        this.bookInner = document.querySelector('.book-inner');

        // Close button
        var closeBtn = document.getElementById('book-close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.close());
        }

        // Navigation buttons
        var prevBtn = document.getElementById('book-prev-btn');
        var nextBtn = document.getElementById('book-next-btn');
        if (prevBtn) prevBtn.addEventListener('click', () => this.prevPage());
        if (nextBtn) nextBtn.addEventListener('click', () => this.nextPage());

        // Keyboard navigation
        this._onKeyDown = (e) => {
            if (!this.isOpen) return;
            if (e.code === 'ArrowLeft') {
                this.prevPage();
                e.preventDefault();
            } else if (e.code === 'ArrowRight') {
                this.nextPage();
                e.preventDefault();
            } else if (e.code === 'Escape') {
                this.close();
                e.preventDefault();
            }
        };
        window.addEventListener('keydown', this._onKeyDown);
    }

    /**
     * Open the reader with a given PDF file path.
     */
    open(pdfPath) {
        if (this.isOpen) return;
        this.isOpen = true;

        this.overlay.classList.add('active');
        document.body.classList.add('reader-open');

        if (pdfPath && typeof pdfjsLib !== 'undefined') {
            this.loadPDF(pdfPath);
        } else {
            // Placeholder if no PDF or pdf.js not loaded
            this.showPlaceholder();
        }
    }

    /**
     * Close the reader overlay.
     */
    close() {
        if (!this.isOpen) return;
        this.isOpen = false;
        this.overlay.classList.remove('active');
        document.body.classList.remove('reader-open');
        this.pdfDoc = null;
        this.currentPage = 1;
        this.totalPages = 0;
    }

    /**
     * Load a PDF document.
     */
    loadPDF(path) {
        var self = this;
        pdfjsLib.getDocument(path).promise.then(function (pdf) {
            self.pdfDoc = pdf;
            self.totalPages = pdf.numPages;
            self.currentPage = 1;
            self.renderSpread();
        }).catch(function (err) {
            console.warn('Could not load PDF:', err);
            self.showPlaceholder();
        });
    }

    /**
     * Render a page spread (left page = currentPage, right page = currentPage+1).
     */
    renderSpread() {
        if (!this.pdfDoc || this.rendering) return;
        this.rendering = true;

        var self = this;
        var leftPageNum = this.currentPage;
        var rightPageNum = this.currentPage + 1;

        // Update page info
        this.pageInfo.textContent = 'Pages ' + leftPageNum + '-' + Math.min(rightPageNum, this.totalPages) + ' / ' + this.totalPages;

        // Render left page
        this.renderPage(leftPageNum, this.leftCanvas, this.leftCtx, function () {
            // Render right page
            if (rightPageNum <= self.totalPages) {
                self.renderPage(rightPageNum, self.rightCanvas, self.rightCtx, function () {
                    self.rendering = false;
                });
            } else {
                // Clear right page if no more pages
                self.rightCtx.clearRect(0, 0, self.rightCanvas.width, self.rightCanvas.height);
                self.rightCanvas.style.opacity = '0.3';
                self.rendering = false;
            }
        });
        this.rightCanvas.style.opacity = '1';
    }

    /**
     * Render a single PDF page onto a canvas.
     */
    renderPage(pageNum, canvas, ctx, callback) {
        this.pdfDoc.getPage(pageNum).then(function (page) {
            var viewport = page.getViewport({ scale: 1 });
            // Scale to fit canvas width
            var desiredWidth = 480;
            var scale = desiredWidth / viewport.width;
            var scaledViewport = page.getViewport({ scale: scale });

            canvas.width = scaledViewport.width;
            canvas.height = scaledViewport.height;

            var renderContext = {
                canvasContext: ctx,
                viewport: scaledViewport
            };
            page.render(renderContext).promise.then(function () {
                if (callback) callback();
            });
        });
    }

    /**
     * Go to previous spread.
     */
    prevPage() {
        if (this.currentPage <= 1) return;
        this.currentPage -= 2;
        if (this.currentPage < 1) this.currentPage = 1;

        // Add page turn animation
        if (this.bookInner) {
            this.bookInner.classList.add('page-turning-left');
            var self = this;
            setTimeout(function () {
                self.renderSpread();
                self.bookInner.classList.remove('page-turning-left');
            }, 250);
        } else {
            this.renderSpread();
        }
    }

    /**
     * Go to next spread.
     */
    nextPage() {
        if (this.currentPage + 2 > this.totalPages) return;
        this.currentPage += 2;

        // Add page turn animation
        if (this.bookInner) {
            this.bookInner.classList.add('page-turning-right');
            var self = this;
            setTimeout(function () {
                self.renderSpread();
                self.bookInner.classList.remove('page-turning-right');
            }, 250);
        } else {
            this.renderSpread();
        }
    }

    /**
     * Show placeholder content when no PDF is available.
     */
    showPlaceholder() {
        // Draw placeholder on left canvas
        this.leftCanvas.width = 480;
        this.leftCanvas.height = 680;
        this.leftCtx.fillStyle = '#f0e6c8';
        this.leftCtx.fillRect(0, 0, 480, 680);
        this.leftCtx.fillStyle = '#5c4b3a';
        this.leftCtx.font = 'bold 24px "EB Garamond", Georgia, serif';
        this.leftCtx.textAlign = 'center';
        this.leftCtx.fillText('Mémoire', 240, 200);
        this.leftCtx.fillText('Maurice', 240, 240);
        this.leftCtx.font = '16px "EB Garamond", Georgia, serif';
        this.leftCtx.fillStyle = '#8b7355';
        this.leftCtx.fillText('Placez votre fichier PDF', 240, 340);
        this.leftCtx.fillText('dans assets/memoire.pdf', 240, 370);

        // Draw placeholder on right canvas
        this.rightCanvas.width = 480;
        this.rightCanvas.height = 680;
        this.rightCtx.fillStyle = '#f0e6c8';
        this.rightCtx.fillRect(0, 0, 480, 680);
        this.rightCtx.fillStyle = '#c4a882';
        this.rightCtx.font = 'italic 16px "EB Garamond", Georgia, serif';
        this.rightCtx.textAlign = 'center';
        this.rightCtx.fillText('Le contenu apparaîtra ici', 240, 340);

        this.pageInfo.textContent = 'Aucun PDF chargé';
    }
}
