       // Enhanced Particle System
        document.addEventListener('DOMContentLoaded', () => {
            // Initialize particles with constellations
            const canvas = document.getElementById('particleCanvas');
            const ctx = canvas.getContext('2d');
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            
            let particles = [];
            const particleCount = Math.floor(window.innerWidth / 10);
            
            class Particle {
                constructor() {
                    this.reset();
                }
                
                reset() {
                    this.x = Math.random() * canvas.width;
                    this.y = Math.random() * canvas.height;
                    this.size = Math.random() * 2 + 0.5;
                    this.baseSize = this.size;
                    this.speedX = (Math.random() - 0.5) * 0.1;
                    this.speedY = (Math.random() - 0.5) * 0.1;
                    this.opacity = Math.random() * 0.3 + 0.05;
                    this.baseX = this.x;
                    this.baseY = this.y;
                    this.density = Math.random() * 30 + 1;
                }
                
                update(mouse) {
                    // Mouse interaction
                    if (mouse.x && mouse.y) {
                        const dx = mouse.x - this.x;
                        const dy = mouse.y - this.y;
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        const forceDirectionX = dx / distance;
                        const forceDirectionY = dy / distance;
                        const maxDistance = 100;
                        const force = (maxDistance - distance) / maxDistance;
                        
                        if (distance < maxDistance) {
                            this.x -= forceDirectionX * force * this.density;
                            this.y -= forceDirectionY * force * this.density;
                            this.size = this.baseSize * 2;
                        } else {
                            if (this.x !== this.baseX) {
                                this.x -= (this.x - this.baseX) / 10;
                            }
                            if (this.y !== this.baseY) {
                                this.y -= (this.y - this.baseY) / 10;
                            }
                            this.size = this.baseSize;
                        }
                    } else {
                        this.x += this.speedX;
                        this.y += this.speedY;
                        
                        // Boundary check with gentle bounce
                        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
                        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
                    }
                }
                
                draw() {
                    ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
            
            function init() {
                particles = [];
                for (let i = 0; i < particleCount; i++) {
                    particles.push(new Particle());
                }
            }
            
            function connectParticles() {
                for (let a = 0; a < particles.length; a++) {
                    for (let b = a; b < particles.length; b++) {
                        const dx = particles[a].x - particles[b].x;
                        const dy = particles[a].y - particles[b].y;
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        
                        if (distance < 100) {
                            ctx.strokeStyle = `rgba(255, 255, 255, ${0.2 - distance/500})`;
                            ctx.lineWidth = 0.5;
                            ctx.beginPath();
                            ctx.moveTo(particles[a].x, particles[a].y);
                            ctx.lineTo(particles[b].x, particles[b].y);
                            ctx.stroke();
                        }
                    }
                }
            }
            
            const mouse = {
                x: null,
                y: null
            };
            
            window.addEventListener('mousemove', (e) => {
                mouse.x = e.x;
                mouse.y = e.y;
            });
            
            window.addEventListener('mouseout', () => {
                mouse.x = undefined;
                mouse.y = undefined;
            });
            
            function animate() {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                
                for (let i = 0; i < particles.length; i++) {
                    particles[i].update(mouse);
                    particles[i].draw();
                }
                connectParticles();
                
                requestAnimationFrame(animate);
            }
            
            init();
            animate();
            
            window.addEventListener('resize', () => {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
                init();
            });
        });  
