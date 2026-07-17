(function () {
  var L = window.LUMA = window.LUMA || {};

  L.Dialogue = function (game) {
    this.game = game;
    this.box = document.getElementById("dialogueBox");
    this.nameEl = document.getElementById("dialogueName");
    this.textEl = document.getElementById("dialogueText");
    this.choiceEl = document.getElementById("dialogueChoices");
    this.nextButton = document.getElementById("dialogueNext");
    this.pages = [];
    this.index = 0;
    this.visibleChars = 0;
    this.done = null;
    this.active = false;
    this.name = "";
    this.choices = null;
    this.bind();
  };

  L.Dialogue.prototype.bind = function () {
    var self = this;
    this.nextButton.addEventListener("click", function () {
      self.advance();
    });
  };

  L.Dialogue.prototype.show = function (name, pages, done, choices) {
    this.name = name || "";
    this.pages = Array.isArray(pages) ? pages.slice() : [String(pages || "")];
    this.index = 0;
    this.visibleChars = 0;
    this.done = done || null;
    this.choices = choices || null;
    this.active = true;
    this.nameEl.textContent = this.name;
    this.choiceEl.innerHTML = "";
    this.box.classList.remove("hidden");
    this.game.mode = "dialogue";
    this.render();
  };

  L.Dialogue.prototype.update = function (dt) {
    if (!this.active) return;
    var page = this.pages[this.index] || "";
    if (this.visibleChars < page.length) {
      var speed = (this.game.state.settings && this.game.state.settings.textSpeed) || 28;
      this.visibleChars = Math.min(page.length, this.visibleChars + dt * speed);
      if (Math.floor(this.visibleChars) % 4 === 0 && L.Audio) L.Audio.play("dialogue");
      this.render();
    }
    if (this.game.input.consume("action")) this.advance();
    if (this.game.input.consume("menu")) this.close();
  };

  L.Dialogue.prototype.render = function () {
    var page = this.pages[this.index] || "";
    this.textEl.textContent = page.slice(0, Math.floor(this.visibleChars));
    this.nextButton.classList.toggle("hidden", this.choices && this.index === this.pages.length - 1 && this.visibleChars >= page.length);
    if (this.choices && this.index === this.pages.length - 1 && this.visibleChars >= page.length) this.renderChoices();
  };

  L.Dialogue.prototype.renderChoices = function () {
    var self = this;
    this.choiceEl.innerHTML = "";
    this.choices.forEach(function (choice) {
      var button = document.createElement("button");
      button.textContent = choice.label;
      button.addEventListener("click", function () {
        if (L.Audio) L.Audio.play("confirm");
        self.close();
        if (choice.onChoose) choice.onChoose();
      });
      self.choiceEl.appendChild(button);
    });
  };

  L.Dialogue.prototype.advance = function () {
    if (!this.active) return;
    var page = this.pages[this.index] || "";
    if (this.visibleChars < page.length) {
      this.visibleChars = page.length;
      this.render();
      return;
    }
    if (this.choices && this.index === this.pages.length - 1) return;
    this.index += 1;
    if (this.index >= this.pages.length) {
      this.close();
      return;
    }
    this.visibleChars = 0;
    this.choiceEl.innerHTML = "";
    this.render();
  };

  L.Dialogue.prototype.close = function () {
    if (!this.active) return;
    this.active = false;
    this.box.classList.add("hidden");
    this.choiceEl.innerHTML = "";
    this.game.mode = "world";
    var done = this.done;
    this.done = null;
    if (done) done();
  };
})();
