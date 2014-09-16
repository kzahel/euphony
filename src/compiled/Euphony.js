// Generated by CoffeeScript 1.5.0
(function() {
    window.cacheStorage = {}
  var Euphony,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Euphony = (function() {

    function Euphony() {
      this.setProgress = __bind(this.setProgress, this);
      this.setCurrentTime = __bind(this.setCurrentTime, this);
      this.getEndTime = __bind(this.getEndTime, this);
      this.pause = __bind(this.pause, this);
      this.stop = __bind(this.stop, this);
      this.resume = __bind(this.resume, this);
      this.start = __bind(this.start, this);
      var _this = this;
      this.design = new PianoKeyboardDesign();
      this.keyboard = new PianoKeyboard(this.design);
      this.rain = new NoteRain(this.design);
      this.particles = new NoteParticles(this.design);
      this.player = MIDI.Player;
      this.player.addListener(function(data) {
        var NOTE_OFF, NOTE_ON, message, note;
        NOTE_OFF = 128;
        NOTE_ON = 144;
        note = data.note, message = data.message;
        if (message === NOTE_ON) {
          _this.keyboard.press(note);
          return _this.particles.createParticles(note);
        } else if (message === NOTE_OFF) {
          return _this.keyboard.release(note);
        }
      });
      this.player.setAnimation({
        delay: 20,
        callback: function(data) {
          var end, now;
          now = data.now, end = data.end;
          if (typeof _this.onprogress === "function") {
            _this.onprogress({
              current: now,
              total: end
            });
          }
          return _this.rain.update(now * 1000);
        }
      });
    }

    Euphony.prototype.initScene = function() {
      var _this = this;
      this.scene = new Scene('#canvas');
      this.scene.add(this.keyboard.model);
      this.scene.add(this.rain.model);
      this.scene.add(this.particles.model);
      return this.scene.animate(function() {
        _this.keyboard.update();
        return _this.particles.update();
      });
    };

    Euphony.prototype.initMidi = function(callback) {
      return MIDI.loadPlugin(function() {
        MIDI.channels[9].mute = true;
        return typeof callback === "function" ? callback() : void 0;
      });
    };

    Euphony.prototype.loadBuiltinPlaylist = function(callback) {
      var _this = this;
      if (this.playlist) {
        return callback(this.playlist);
      }
      return $.getJSON('euphony/tracks/index.json', function(playlist) {
        _this.playlist = playlist;
        return callback(_this.playlist);
      });
    };

    Euphony.prototype.loadBuiltinMidi = function(id, callback) {
      var _this = this;
      if (!((0 <= id && id < this.playlist.length))) {
        return;
      }
      if (typeof cacheStorage !== "undefined" && cacheStorage !== null ? cacheStorage[id] : void 0) {
        return this.loadMidiFile(cacheStorage[id], callback);
      }
      return $.ajax({
        url: "euphony/tracks/" + this.playlist[id],
        dataType: 'text',
        success: function(data) {
          _this.loadMidiFile(data, callback);
          try {
            return typeof cacheStorage !== "undefined" && cacheStorage !== null ? cacheStorage[id] = data : void 0;
          } catch (e) {
            return typeof console !== "undefined" && console !== null ? console.error('cacheStorage quota limit reached') : void 0;
          }
        }
      });
    };

    Euphony.prototype.loadMidiFile = function(midiFile, callback) {
      var _this = this;
      return this.player.loadFile(midiFile, function() {
        return _this.rain.setMidiData(_this.player.data, callback);
      });
    };

    Euphony.prototype.start = function() {
      this.player.start();
      return this.playing = true;
    };

    Euphony.prototype.resume = function() {
      this.player.currentTime += 1e-6;
      this.player.resume();
      return this.playing = true;
    };

    Euphony.prototype.stop = function() {
      this.player.stop();
      return this.playing = false;
    };

    Euphony.prototype.pause = function() {
      this.player.pause();
      return this.playing = false;
    };

    Euphony.prototype.getEndTime = function() {
      return this.player.endTime;
    };

    Euphony.prototype.setCurrentTime = function(currentTime) {
      this.player.pause();
      this.player.currentTime = currentTime;
      if (this.playing) {
        return this.player.resume();
      }
    };

    Euphony.prototype.setProgress = function(progress) {
      var currentTime;
      currentTime = this.player.endTime * progress;
      return this.setCurrentTime(currentTime);
    };

    Euphony.prototype.on = function(eventName, callback) {
      return this["on" + eventName] = callback;
    };

    return Euphony;

  })();

  this.Euphony = Euphony;

}).call(this);
