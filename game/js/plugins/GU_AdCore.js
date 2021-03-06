/**
 * @file Guelstie Ad-Sense core.
 * @author Guelstie Project
 * @version 0.0.1
 */
// =============================================================================
// GU_AdCore.js
// =============================================================================
/*:
 @plugindesc v 0.0.1 Guesltie Project Ad-Sense Core plugin.

 @author Guesltie Project

 @param Ad Tag
 @desc
 Default:
 @default

 ================================================================================
▼ TERMS OF USE
================================================================================

===============================================================================
▼ DEPENDENCIES
===============================================================================
 Requires GU Core.

===============================================================================
▼ INFORMATION
===============================================================================

 ============================================================================
 ▼ DONATIONS
 ============================================================================

===============================================================================
▼ INSTRUCTIONS
===============================================================================

 */

/* Google IMA SDK DOCS:
https://developers.google.com/interactive-media-ads/docs/sdks/html5/v3/
*/

/* PROTOTYPE, Test Build */

'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

if (typeof GU === 'undefined') {
  var strA = 'You need to install the GU Core plugin';
  var strB = 'in order for this plugin to work! Please visit';
  var strC = '\n https://github.com/Guelstie/Guelstie-Plugins';
  var strD = ' to download the latest verison.';
  throw new Error(strA + strB + strC + strD);
} else {
  GU.Utilities.registerPlugin('AdCore', '0.0.1', 'LTNGames');
}

if (typeof google === 'undefined') {}
/* Add Google IMA3 SDK to the DOM for Google AdSense
* FIXME Won't load file due to Access control header with XHR request
*/
// const script = document.createElement('script')
// script.type = 'text/javascript'
// script.src = '//imasdk.googleapis.com/js/sdkloader/ima3.js'
// document.body.appendChild(script)
// console.log(script)
// /* Add style.css to DOM */
// const css = document.createElement('link')
// css.type = 'text/css'
// css.src = '/style.css'
// document.body.appendChild(css)


/* Will need to create a custom MV class to handle the video player, probably a new canvas with PIXI elements these elements
will need to be associated with the AdsManager class
*/

(function ($) {
  var IMA = google.ima;
  /**
   * Based on the Advanced example of the IMA SDK Examples
   *
   * @class AdsManager
   */

  var AdsManager = function () {
    function AdsManager(application, videoPlayer) {
      _classCallCheck(this, AdsManager);

      // TODO customClick must point to a button in the dom. I'll maniuplate so it's a sprite button from RPG Maker MV
      this._application = application;
      this._videoPlayer = videoPlayer;
      this._contentComplete = false;
      this._customClickDiv = null;
      this._adDisplayContainer = null;
      this._adsLoader = null;
      this._adsManager = null;
    }

    _createClass(AdsManager, [{
      key: 'initialize',
      value: function initialize() {
        IMA.setting.setVpaidMode(IMA.ImaSdkSettings.VpaidMode.ENABLED);
        // TODO - LTNGames - add plugin parameter for the locale.
        IMA.settings.setLocale('en-us');
        this.createAdsDisplayContainer();
        this.addEventListeners();
      }
    }, {
      key: 'createAdsDisplayContainer',
      value: function createAdsDisplayContainer() {
        var adContainer = this._videPlayer.adContainer;
        var contentPlayer = this._videoPlayer.contentPlayer;
        var clickTracker = this.__customClickDiv;
        /* AdDisplayContainer(containerElement, opt_videoElement, opt_clickTrackingElement */
        this._adDisplayContainer = new IMA.AdDisplayContainer(adContainer, contentPlayer, clickTracker);
        this._adsLoader = new IMA.AdsLoader(this._adDisplayContainer);
      }
    }, {
      key: 'addEventListeners',
      value: function addEventListeners() {
        var loadedEvent = IMA.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED;
        var errorEvent = IMA.AdErrorEvent.Type.AD_ERROR;
        this._adsLoader.addEventListener(loadedEvent, this.onAdsManagerLoaded, false, this);
        this._adsLoader.addEventListener(errorEvent, this.onAdError, false, this);
      }
    }, {
      key: 'initialUserAction',
      value: function initialUserAction() {
        this._adDisplayContainer.initialize();
        this._videPlayer.contentPlayer.load();
      }
    }, {
      key: 'requestAds',
      value: function requestAds(adTagUrl) {
        var adsRequest = new IMA.AdsRequest();
        adsRequest.adTagUrl = adTagUrl;
        adsRequest.linearAdSlotWidth = this._videoPlayer.width;
        adsRequest.linearAdSlotHeight = this._videoPlayer.height;
        adsRequest.nonLinearAdSlotWidth = this._videoPlayer.width;
        adsRequest.nonLinearAdSlotHeight = this._videoPlayer.height;
        this._adsLoader.requestAds(adsRequest);
      }
    }, {
      key: 'pauseAd',
      value: function pauseAd() {
        if (this._adsManager) {
          this._adsManager.pause();
        }
      }
    }, {
      key: 'resumeAd',
      value: function resumeAd() {
        if (this._adsManager) {
          this._adsManager.resume();
        }
      }
    }, {
      key: 'resize',
      value: function resize(width, height) {
        if (this._adsManager) {
          this._adsManager.resize(width, height, IMA.ViewMode.FULLSCREEN);
        }
      }
    }, {
      key: 'contentEnded',
      value: function contentEnded() {
        this.contentComplete = true;
        this._adsLoader.contentComplete();
      }
    }, {
      key: 'onAdsManagerLoaded',
      value: function onAdsManagerLoaded(adsLoadedEvent) {
        var contentPlayer = this._videoPlayer.contentPlayer;
        this._application.log('Ads Loaded');
        var adsRenderingSettings = new IMA.AdsRenderingSetting();

        adsRenderingSettings.restoreCustomPlaybackStateOnAdBreakComplete = true;
        this._adsManager = adsLoadedEvent.getAdsManager(contentPlayer, adsRenderingSettings);
        this.processAdsManager_(this._adsManager);
      }
    }, {
      key: 'processAdsManager',
      value: function processAdsManager(adsManager) {
        if (adsManager.isCustomClickTrackingUsed()) {
          this._customClickDiv.style.display = 'table';
        }
        var initWidth = 0;
        var initHeight = 0;
        var contentPauseEvent = IMA.AdEvent.Type.CONTENT_PAUSE_REQUESTED;
        var contentResumeEvent = IMA.AdEvent.Type.CONTENT_RESUME_REQUESTED;
        var errorEvent = IMA.AdErrorEvent.Type.AD_ERROR;
        // Attach the pause/resume events.
        adsManager.addEventListener(contentPauseEvent, this.onContentPauseRequested, false, this);
        adsManager.addEventListener(contentResumeEvent, this.onContentResumeRequested, false, this);
        // Handle errors.
        adsManager.addEventListener(errorEvent, this.onAddError, false, this);
        this.addEventsForAdsManager(adsManager);

        if (this.application_.fullscreen) {
          initWidth = this._application.fullscreenWidth;
          initHeight = this._application.fullscreenHeight;
        } else {
          initWidth = this._videoPlayer.width;
          initHeight = this._videoPlayer.height;
        }
        adsManager.init(initWidth, initHeight, IMA.ViewMode.NORMAL);
        adsManager.start();
      }
    }, {
      key: 'addEventsForAdsManager',
      value: function addEventsForAdsManager(adsManager) {
        var events = [IMA.AdEvent.Type.ALL_ADS_COMPLETED, IMA.AdEvent.Type.CLICK, IMA.AdEvent.Type.COMPLETE, IMA.AdEvent.Type.FIRST_QUARTILE, IMA.AdEvent.Type.LOADED, IMA.AdEvent.Type.MIDPOINT, IMA.AdEvent.Type.PAUSED, IMA.AdEvent.Type.STARTED, IMA.AdEvent.Type.THIRD_QUARTILE];

        for (var index in events) {
          if (events.hasOwnProperty(index)) {
            adsManager.addEventListener(events[index], this.onAdEvent, false, this);
          }
        }
      }
    }, {
      key: 'onContentPauseRequested',
      value: function onContentPauseRequested() {
        this._application.pauseForAd();
        this._application.setVideoEndedCallbackEnabled(false);
      }
    }, {
      key: 'onContentResumeRequested',
      value: function onContentResumeRequested() {
        this._application.setVideoEndedCallbackEnabled(true);
        if (!this.contentCompleteCalled) {
          this._application.resumeAfterAd();
        }
      }
    }, {
      key: 'onAdEvent',
      value: function onAdEvent(adEvent) {
        this._application.log('Ad event: ' + adEvent.type);

        if (adEvent.type === IMA.AdEvent.Type.CLICK) {
          this.application_.adClicked();
        } else if (adEvent.type === IMA.AdEvent.Type.LOADED) {
          var ad = adEvent.getAd();
          if (!ad.isLinear()) {
            this.onContentResumeRequested();
          }
        }
      }
    }, {
      key: 'onAdError',
      value: function onAdError(adErrorEvent) {
        this._application.log('Ad error: ' + adErrorEvent.getError().toString());
        if (this._adsManager) {
          this._adsManager.destroy();
        }
        this._application.resumeAfterAd();
      }
    }]);

    return AdsManager;
  }();

  console.log(GU.Utilities.requirePlugin(false, 'AdCore'));
})(GU.Utilities.requirePlugin(false, 'AdCore'));