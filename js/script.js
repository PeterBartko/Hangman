const app = Vue.createApp({
    data() {
        return {
            length: null,
            char: null,
            over: false,
            hl: false,
            json: [],
            all_words: [],
            all_helps: [],
            hlaska: "",
            hang_prog: 1,
            score: 0,
            info: {
                help: "",
                lvl: "",
                bolo: "",
            },
            show: {
                menu: true,
                game: false
            },
            current: {
                hidden: "",
                word: "",
                help: "",
            }
        }
    },
    methods: {
        to_game() {
            this.show.game = true
            this.show.menu = false
            this.draw_all()
            if (localStorage.getItem('hidden') != null)
                this.current.hidden = localStorage.getItem('hidden')
            if (localStorage.getItem('abeceda') != null)
                localStorage.getItem('abeceda').split(',').forEach(id => {
                    let char = document.querySelector(`#${id}`)
                    char.classList.add('dis')
                    char.setAttribute('draggable', 'false')
                })
            if (localStorage.getItem('score') != null)
                this.score = parseInt(localStorage.getItem('score'))
        },
        replaceAt(string, index, replacement) {
            string = string.split('')
            string[index] = replacement
            return string.join('').toUpperCase()
        },
        get_help() {
            this.info.help = this.current.help
            setTimeout(() => this.info.help = "", 3000)
        },
        hide_word(word) {
            return word.split('').map(ch => ch == ' ' ? ' ': '_').join('')
        },
        dis_char() {
            let char = document.querySelector(`#${this.char.toUpperCase()}`)
            char.classList.add('dis')
            char.setAttribute('draggable', 'false')
        },
        get_levels() {
            this.all_words = []
            this.all_helps = []
            while (this.all_words.length < 10) {
                const i = Math.floor(Math.random() * this.json.length)
                if (!this.all_words.some(lvl => lvl === this.json[i].word)) {
                    this.all_words.push(this.json[i].word)
                    this.all_helps.push(this.json[i].help)
                }
            }
        },
        won() {
            for (const ch of this.current.hidden.split(''))
               if (ch === '_') return false 
            return true
        },
        dragover(event) {
            this.over = true
            if (event.target.id != 'hadanka-tu')
                this.hl = false
        },
        dragleave() {
            setTimeout(() => {this.over = false}, 40)
        },
        clear_storage() {
            localStorage.removeItem('hang')
            localStorage.removeItem('hidden')
            localStorage.removeItem('abeceda')
        },

        reset(event) {
            if (event != undefined) {
                this.score = 0
                localStorage.removeItem('score')
            }
            this.get_levels()
            localStorage.setItem('levels', this.all_words)
            localStorage.setItem('helps', this.all_helps)
            this.clear_storage()
            this.init()
            this.restart()
        },
        restart() {
            this.hang_prog = 1
            this.hlaska = ""
            this.info.bolo = ""
            document.querySelector('#hlaska').classList.remove('correct')
            document.querySelectorAll('.dis').forEach(char => {
                char.classList.remove('dis')
                char.setAttribute('draggable', 'true')
            })
            document.querySelectorAll('.path').forEach(path => {
                path.classList.add('hide')
            })
        },
        after_round() {
            if (localStorage.getItem('levels').split(',').length == 1) {
                document.querySelector('.overlay').classList.add("visible")
                this.show.game = false
                this.reset()
                return
            }
            this.clear_storage()
            setTimeout(() => {
                this.info.lvl = 11 - localStorage.getItem('levels').split(',').length
                let storage = this.shift()
                this.current.word = storage[0]
                this.current.help = storage[1]
                this.current.hidden = this.hide_word(this.current.word)
                this.restart()
            }, 2000)
        },
        draw(hang_prog, check) {
            document.querySelector(`#path${hang_prog}`).classList.remove('hide')
            anime({
                targets: `#sibenica #path${hang_prog}`,
                duration: 600,
                loop: 1,
                direction: 'normal',
                easing: 'linear',
                strokeDashoffset: [anime.setDashoffset, 1],
            })
            if (check) localStorage.setItem('hang', this.hang_prog)
            if (this.hang_prog++ == 7) {
                this.hlaska = "Odpoved bola"
                this.info.bolo = this.current.word
                this.clear_storage()
                this.after_round()
            }
        },
        draw_all() {
            for (let i = 1; i <= localStorage.getItem('hang'); i++) 
                this.draw(i, false)
        },
        odhal_pismeno() {
            let uhadol = false 
            this.current.word.split('').forEach((ch, i) => {
                if (ch === this.char) {
                    this.current.hidden = this.replaceAt(this.current.hidden, i, this.char)
                    uhadol = true
                }
            })

            localStorage.setItem('hidden', this.current.hidden)
            this.dis_char()
            let letters = document.querySelectorAll('.dis')
            localStorage.setItem('abeceda', Array.from(letters).map(letter => letter.id))

            if (!uhadol) this.draw(this.hang_prog, true)
            
            if (this.won()) {
                document.querySelector("#hlaska").classList.add('correct')
                this.hlaska = `Correct!`
                this.score++
                localStorage.setItem('score', this.score)
                this.after_round()
            }
        },
        shift() {
            let lvls = localStorage.getItem('levels').split(',')
            let hlps = localStorage.getItem('helps').split(',')
            localStorage.setItem('levels', lvls.slice(1, lvls.length))
            localStorage.setItem('helps', hlps.slice(1, hlps.length))
            return [lvls.slice(1, lvls.length)[0], hlps.slice(1, hlps.length)[0]]
        },
        init() {
            this.current.word = localStorage.getItem('levels').split(',')[0]
            this.current.help = localStorage.getItem('helps').split(',')[0]
            this.current.hidden = this.hide_word(this.current.word)
            this.info.lvl = 11 - localStorage.getItem('levels').split(',').length
        }
    },
    async mounted() {
        const result = await fetch("./levels.json")
        const words = await result.json()

        this.json = words.words

        this.get_levels()

        if (localStorage.getItem('levels') == null) {
            localStorage.setItem('levels', this.all_words)
            localStorage.setItem('helps', this.all_helps)
        }

        this.init()

        document.addEventListener('dragend', (event) => {
            if (this.over) {
                this.char = event.target.id.toLowerCase()
                this.odhal_pismeno()
            }
            this.hl = false
        })
        document.addEventListener('dragstart', (event) => {
            if (event.target.classList[0] === 'letter') {
                this.hl = true
            }
        })
        document.addEventListener('touchstart', (event) => {
            if (event.target.classList[0] === 'letter') {
                this.char = event.target.id.toLowerCase()
                this.odhal_pismeno()
            }
            else if (event.target.classList[0] === 'ns') {
                this.char = event.target.innerText.toLowerCase()
                this.odhal_pismeno()
            }   
        })
        document.querySelector('.overlay').addEventListener('click', () => {
            document.querySelector('.overlay').classList.remove('visible')
            this.show.menu = true
            this.score = 0
            localStorage.removeItem('score')
        })
    }
})
app.mount("#app")
// navigator.serviceWorker.register("./serviceWorker.js").catch(err => console.log("error", err))