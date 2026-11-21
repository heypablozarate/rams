// Shared RAMS timing and spring values.
export const motionTokens = {
  "springSettling": {
    "chartShapeDelta": 0.0005,
    "chartValueDelta": 0.001,
    "chartPositionDelta": 0.01,
    "controlDelta": 0.002,
    "chartPointerDelta": 0.01,
    "lineGlideDelta": 0.0001,
    "barZoomDelta": 0.00001,
    "meterFitDelta": 0.01,
    "slicePopDelta": 0.002,
    "sliceValueRelativeDelta": 0.001,
    "sliceValueMinimumDelta": 0.000001,
    "snapBackDelta": 0.05,
    "controlSpeed": 0.02,
    "calendarStripDelta": 0.002,
    "scrubDelta": 0.01,
    "scrubSpeed": 0.5,
    "invalidFieldDelta": 0.1,
    "toastReleaseDelta": 2,
    "toastReleaseSpeed": 40,
    "chartSpeedPerDelta": 2,
    "elasticSpeedPerDelta": 10
  },
  "cssPlayback": {
    "uniformEase": "linear",
    "activeIterations": "infinite",
    "reducedIterations": 1
  },
  "duration": {
    "instant": 0.12,
    "fast": 0.16,
    "exit": 0.18,
    "standard": 0.24,
    "considered": 0.48,
    "display": 0.48,
    "activity": 0.8,
    "breathe": 1.6,
    "data": 0.64,
    "reduced": 0
  },
  "ease": {
    "enter": [
      0.16,
      1,
      0.3,
      1
    ],
    "exit": [
      0.7,
      0,
      0.84,
      0
    ],
    "standard": [
      0.22,
      1,
      0.36,
      1
    ],
    "drawerFallback": [
      0.32,
      0.72,
      0,
      1
    ],
    "inOut": [
      0.65,
      0,
      0.35,
      1
    ]
  },
  "spring": {
    "responsive": {
      "type": "spring",
      "stiffness": 520,
      "damping": 44
    },
    "gentle": {
      "type": "spring",
      "stiffness": 340,
      "damping": 34
    },
    "snappy": {
      "type": "spring",
      "visualDuration": 0.26,
      "bounce": 0
    },
    "smooth": {
      "type": "spring",
      "visualDuration": 0.4,
      "bounce": 0
    },
    "morph": {
      "type": "spring",
      "visualDuration": 0.42,
      "bounce": 0
    },
    "invalidField": {
      "type": "spring",
      "stiffness": 900,
      "damping": 57
    },
    "fileDropzoneGlow": {
      "stiffness": 260,
      "damping": 32,
      "mass": 0.8
    }
  },
  "stagger": {
    "char": 0.016,
    "word": 0.04,
    "line": 0.08,
    "item": 0.035
  },
  "blur": {
    "subtle": 2,
    "soft": 4,
    "text": 8
  },
  "schemaVersion": 1,
  "sequence": {
    "handoff": 0.08,
    "settle": 0.12,
    "maxStagger": 0.14,
    "textBudget": 0.32,
    "hydrationFallback": 2.4
  },
  "roles": {
    "feedback": {
      "duration": "fast",
      "ease": "standard",
      "purpose": "Visual feedback for controls."
    },
    "enter": {
      "duration": "standard",
      "ease": "enter",
      "purpose": "Introduce content and surfaces."
    },
    "exit": {
      "duration": "exit",
      "ease": "exit",
      "purpose": "Remove the previous state."
    },
    "replace": {
      "duration": "standard",
      "ease": "standard",
      "purpose": "Replace content with a single owner of presence."
    },
    "selection": {
      "spring": "snappy",
      "purpose": "Move the selection indicator."
    },
    "resize": {
      "spring": "smooth",
      "purpose": "Preserve continuity during a size change."
    },
    "morph": {
      "spring": "morph",
      "purpose": "Preserve the identity of an object."
    },
    "displayReveal": {
      "duration": "display",
      "ease": "enter",
      "purpose": "Introduce a composition once, with a bounded sequence."
    },
    "data": {
      "duration": "data",
      "ease": "standard",
      "purpose": "Interpolate data without changing its final value."
    },
    "activity": {
      "duration": "activity",
      "ease": "linear",
      "purpose": "Indicate real activity, with a static alternative."
    },
    "breathing": {
      "duration": "breathe",
      "ease": "inOut",
      "purpose": "Low-frequency activity feedback."
    },
    "themeReveal": {
      "duration": "considered",
      "ease": "inOut",
      "purpose": "An interruptible theme change."
    },
    "emphasis": {
      "duration": "considered",
      "ease": "standard",
      "purpose": "Highlight new content once, without repetition or delaying the action."
    }
  },
  "reduced": {
    "duration": 0,
    "stagger": 0,
    "transform": false,
    "blur": false,
    "autoplay": false,
    "scrollBehavior": "auto",
    "policy": "Show the final state without waiting for animation; preserve focus and content."
  },
  "cssSpring": {
    "duration": 0.58,
    "easing": "linear(0, 0.0213, 0.0739, 0.1443, 0.2235, 0.305, 0.3849, 0.4606, 0.5305, 0.594, 0.6508, 0.7011, 0.7452, 0.7836, 0.8168, 0.8454, 0.8699, 0.8907, 0.9084, 0.9234, 0.9361, 0.9467, 0.9557, 0.9632, 0.9694, 0.9747, 0.979, 0.9826, 0.9857, 0.9882, 0.9902, 0.992, 0.9934, 0.9946, 0.9955, 0.9963, 1)"
  },
  "keyframes": {
    "countdown": {
      "unitMinimumDigits": 2,
      "faceScale": 0.92,
      "pulseOpacity": 0.5,
      "pulseScale": 2.6,
      "pulseCycles": 2,
      "pulseFadeProgress": 0.7
    },
    "activityHeatmap": {
      "waveStepMaxMs": 12,
      "inViewAmount": 0.35,
      "tooltipTextTravelEm": 0.3,
      "summaryDigitTravelEm": 0.3,
      "summaryPeriodTravelEm": 0.3,
      "tooltipHiddenScale": 0.96,
      "cellInitialScale": 0.5,
      "widthMorphWindowMs": 600,
      "revealSettleMs": 700,
      "legendDismissMs": 90,
      "tooltipDismissMs": 110,
      "touchTooltipDismissMs": 2400
    },
    "treeView": {
      "rowEnterPx": -6,
      "rowExitPx": -4,
      "folderEnterScale": 0.6
    },
    "stepper": {
      "textTravelEm": 0.3,
      "glyphEnterScale": 0.5,
      "ringEnterScale": 0.6,
      "pressScale": 0.92
    },
    "treemap": {
      "inViewAmount": 0.25,
      "crumbTravelPx": 6,
      "totalTravelPx": 6,
      "initialRevealDelayShare": 0.3,
      "zoomBounce": 0.06,
      "crumbPressScale": 0.97,
      "tooltipHiddenScale": 0.96,
      "visibleOpacity": 0.01,
      "interactiveOpacity": 0.6,
      "priorVisibleOpacity": 0.5
    },
    "elasticSlider": {
      "bubbleEnterScale": 0.7,
      "bubbleExitScale": 0.85,
      "thumbLiftScale": 1.28,
      "tickPulseScale": 2.1,
      "trackPressGain": 0.45,
      "trackStretchThinning": 0.32,
      "bubbleSwingDegPerPxSecond": 0.009,
      "bubbleSwingLimitDeg": 11,
      "bubbleTrailSpring": {
        "stiffness": 420,
        "damping": 30,
        "mass": 0.7
      },
      "snapBackBounce": 0.42,
      "edgeTravelPx": 26,
      "detentReachPx": 7,
      "edgeBumpVelocityPx": 260,
      "detentVibrationMs": 6
    },
    "ctaSection": {
      "stageEnterPx": 24,
      "stageInViewShare": 0.35,
      "arrowTravelPx": 3,
      "dismissPressScale": 0.94
    },
    "splitButton": {
      "labelMeasureTolerancePx": 0.1,
      "preservedGlyphMinimum": 2,
      "glyphEnterPx": 5,
      "glyphExitPx": -4,
      "iconEnterScale": 0.6,
      "pressScale": 0.97,
      "menuEnterScale": 0.97,
      "menuExitScale": 0.985,
      "menuTravelPx": 5,
      "menuItemTravelRatio": 0.4,
      "menuExitTravelRatio": 0.5,
      "menuStaggerLimit": 4
    },
    "barChart": {
      "inViewAmount": 0.35,
      "textTravelEm": 0.3
    },
    "slotText": {
      "defaultSpins": 1,
      "landing": [
        0.12,
        0.8,
        0.16,
        1
      ],
      "blurVelocityFactor": 0.05,
      "blurMaxPx": 2.4,
      "blurThresholdPx": 0.15,
      "glyphMeasureTolerancePx": 0.5
    },
    "codeBlock": {
      "textTravelEm": 0.3,
      "sourceEnterTravelPx": 4
    },
    "textMorph": {
      "widthChangeTolerancePx": 0.5,
      "enterScale": 0.8,
      "enterOffsetEm": 0.14,
      "exitScale": 0.86,
      "exitOffsetEm": -0.1
    },
    "textShimmer": {
      "widthChangeTolerancePx": 0.5,
      "bandHalfWidthEm": 2.2,
      "bandFalloff": [
        [
          -1,
          0
        ],
        [
          -0.5,
          0.5
        ],
        [
          -0.2,
          0.9
        ],
        [
          0,
          1
        ],
        [
          0.2,
          0.9
        ],
        [
          0.5,
          0.5
        ],
        [
          1,
          0
        ]
      ],
      "initialDelaySeconds": 0.12,
      "interSweepDelayRatio": 0.32,
      "finishGlideRatio": 0.5,
      "labelEnterOffsetEm": 0.3,
      "labelExitOffsetEm": -0.24,
      "viewportMarginPx": 64
    },
    "inViewTitle": {
      "settleSeconds": 0.8,
      "lineSettleSeconds": 0.86,
      "trackingWordSettleSeconds": 0.9,
      "trackingGlyphSettleSeconds": 1,
      "wipeSettleSeconds": 0.9,
      "blurDurationRatio": 0.78,
      "opacityDurationRatio": 0.56,
      "wordOffsetEm": 0.9,
      "lineOffsetPercent": 112,
      "blurOffsetEm": 0.2,
      "trackingStepEm": 0.06,
      "wipeOffsetEm": -0.12,
      "intersectionShare": 0.45,
      "wordStaggerMultiplier": 1.5
    },
    "textReveal": {
      "riseEm": 0.62
    },
    "confirmMorph": {
      "successDiscEnterScale": 0.5,
      "countdownDigitTravelPx": 6
    },
    "timeline": {
      "rollingTravelEm": 0.3,
      "markerEnterScale": 0.4,
      "markerViewportShare": 0.2,
      "freshRowEnterTravelPx": -10,
      "detailEnterTravelPx": -4
    },
    "avatar": {
      "statusScale": 0.6
    },
    "avatarGroup": {
      "countTravelEm": 0.4,
      "slotScale": 0.9,
      "fanStepPx": 4,
      "hoverRisePx": -2,
      "hoverNeighborPx": 3,
      "nameTravelPx": 3
    },
    "passwordFieldReveal": {
      "startOpacity": 0.35,
      "pressScale": 0.96
    },
    "passwordStrength": {
      "feedbackTravelEm": 0.3,
      "remainingDigitTravelEm": 0.45,
      "ruleCheckStartScale": 0.5,
      "revealPressScale": 0.94,
      "invalidShakeVelocity": -240,
      "meterExitTravelPercent": 101
    },
    "tagInput": {
      "messageTravelEm": 0.35,
      "placeholderTravelEm": 0.3,
      "tagPresenceScale": 0.9,
      "duplicatePulseScale": 1.06,
      "removePressScale": 0.96,
      "ringVisibleThreshold": 0.02
    },
    "numberField": {
      "stepPressScale": 0.82,
      "slotEnterScale": 0.6,
      "slotTravelEm": 0.3,
      "messageWordTravelEm": 0.3,
      "limitNoteTravelEm": 0.45,
      "wheel": {
        "glyphPitchEm": 1.05,
        "opacityFalloffExponent": 1.5,
        "opacityFalloffGain": 1.1,
        "blurStrengthRatio": 0.75,
        "blurRestDistance": 0.02
      },
      "limitFeedback": {
        "shakeEase": "easeOut",
        "feedbackMs": 420,
        "velocity": 130,
        "repeatGain": 0.22,
        "repeatCap": 4,
        "shakeXPx": [
          0,
          -2.5,
          2.5,
          -1.5,
          1,
          0
        ]
      },
      "gesture": {
        "pixelsPerStep": 6,
        "activationTravelPx": 3,
        "shiftTolerancePx": 0.5,
        "holdDelayMs": 400,
        "fastestRepeatMs": 40,
        "repeatBaseMs": 150,
        "repeatDecay": 0.86,
        "limitRepeatMs": 240,
        "initialLimitWaitMs": 120,
        "limitHintMs": 1500,
        "underMinimumWarnMs": 700,
        "continuedPushWindowMs": 700
      },
      "scrubResistance": {
        "capPx": 10,
        "gain": 0.55
      }
    },
    "metricCard": {
      "textTravelEm": 0.3,
      "changeScale": 0.96
    },
    "animatedCounter": {
      "labelTravelEm": 0.3,
      "viewportShare": 0.6
    },
    "inlineEdit": {
      "actionPressScale": 0.96,
      "messageTravelEm": 0.3,
      "slotEnterScale": 0.6,
      "savedFeedbackHoldMs": 1800,
      "failureFlashHoldMs": 1400,
      "failureFlashTotalMs": 2000,
      "measureTolerancePx": 0.1
    },
    "chipGroup": {
      "overflowLabelTravelEm": 0.3,
      "revealedChipScale": 0.9,
      "pressScale": 0.97,
      "checkMaxScale": 1.1,
      "checkOpacityGain": 1.4,
      "heightTolerancePx": 0.5,
      "reflowWindowMs": 160,
      "minimumCheckPathLength": 0.001
    },
    "disclosure": {
      "reverseDeg": 180,
      "expandRightDeg": 90
    },
    "iconMorph": {
      "defaultSizePx": 24,
      "defaultStrokePx": 1.75,
      "playStrokePx": 1.5,
      "menuMiddleScale": 0.2,
      "menuOuterTravel": 6,
      "menuCrossTurnDeg": 45,
      "copySheetScale": 0.7,
      "copySheetTravel": 4,
      "sunRaysScale": 0.4,
      "sunRaysTurnDeg": 90,
      "bellAngles": [
        0,
        16,
        -13,
        9,
        -6,
        3,
        0
      ],
      "bellClapperOffsets": [
        0,
        -2.2,
        2,
        -1.4,
        0.9,
        -0.4,
        0
      ],
      "bellEase": "easeOut",
      "heartScale": [
        0.72,
        1.14,
        1
      ],
      "heartBurstStartRadius": 4,
      "heartBurstEndRadius": 13,
      "heartBurstStroke": 3,
      "heartBurstOpacity": 0.5,
      "heartSparkStart": 7,
      "heartSparkEnd": 14,
      "heartSparkEndScale": 0.3,
      "heartSparkCount": 7,
      "heartSparkSmallRadius": 1,
      "heartSparkLargeRadius": 1.4
    },
    "expandingSearch": {
      "visibleResultLimit": 6,
      "defaultWidthPx": 360,
      "initialCollapsedPx": 44,
      "panelOffsetPx": 8,
      "panelCollisionPx": 12,
      "pressScale": 0.97,
      "clearScale": 0.6
    },
    "sparkline": {
      "labelTravelEm": 0.3,
      "drawViewportShare": 0.5,
      "defaultWidthPx": 160,
      "defaultHeightPx": 52,
      "plotInsetPx": 5,
      "lineStrokePx": 2.5,
      "guideStrokePx": 1,
      "clipOverhangPx": 16,
      "lineVisibleProgress": 0.001,
      "restDotPx": 7,
      "scrubDotPx": 10
    },
    "gauge": {
      "labelTravelEm": 0.3,
      "drawViewportShare": 0.5,
      "capFadeSweepShare": 0.02
    },
    "userMenuDetail": {
      "typeaheadResetMs": 500,
      "labelTravelEm": 0.35
    },
    "userMenuExit": {
      "curve": [
        0.4,
        0,
        1,
        1
      ]
    },
    "userMenuSheetDrag": {
      "upwardElasticity": 0.04,
      "downwardElasticity": 0.9,
      "dismissDistancePx": 80,
      "dismissVelocityPxPerSecond": 500
    },
    "userMenu": {
      "viewportMarginPx": 12,
      "panelGapPx": 8,
      "panelEnterScale": 0.94,
      "panelExitScale": 0.97,
      "rowTravelPx": 3
    },
    "rating": {
      "wordEnterTravelEm": 0.3,
      "wordExitTravelEm": -0.25,
      "pressedScale": 0.86,
      "softScale": 0.9,
      "popVelocity": 9,
      "waveGapMs": 260
    },
    "announcementBar": {
      "heightChangeTolerancePx": 0.5,
      "faceEnterPercent": 70,
      "faceExitPercent": 60,
      "countdownDigitTravelPercent": 70,
      "actionHoverTravelPx": 2
    },
    "searchField": {
      "clearHiddenScale": 0.8,
      "clearPressScale": 0.96
    },
    "button": {
      "compactButtonPx": 48,
      "compactPressScale": 0.96,
      "iconEnterExitScale": 0.6,
      "loaderEnterScale": 0.6,
      "loaderExitScale": 0.8
    },
    "expandableText": {
      "overflowTolerancePx": 1,
      "ease": [
        0.32,
        0.5,
        0.2,
        1
      ],
      "openBaseSeconds": 0.5,
      "openPixelsPerSecond": 1600,
      "openMaxExtraSeconds": 0.1,
      "closeBaseSeconds": 0.4,
      "closePixelsPerSecond": 2000,
      "closeMaxExtraSeconds": 0.05,
      "fadeExponent": 1.35,
      "fadeStrength": 0.96,
      "fadeStopThreshold": 0.002,
      "labelTravelPx": 4
    },
    "copyFeedback": {
      "holdMs": 1900
    },
    "copyButton": {
      "textPressScale": 0.97,
      "iconPressScale": 0.96,
      "iconEnterScale": 0.85,
      "labelEnterTravelPx": 2
    },
    "newsletter": {
      "issueDepthStepPx": 12,
      "issueDepthScaleLoss": 0.045,
      "invalidShakeEase": "easeOut",
      "upcomingEnterTravelPx": 56,
      "messageTravelPx": 6,
      "invalidShake": [
        0,
        -6,
        5,
        -3,
        1,
        0
      ]
    },
    "fileUpload": {
      "dragLiftPx": 3,
      "actionPressScale": 0.96,
      "labelTravelEm": 0.3,
      "retryEnterScale": 0.6,
      "readyEnterScale": 0.8
    },
    "nativeChart": {
      "easing": "ease-out"
    },
    "dismiss": {
      "pressScale": 0.96
    },
    "statusSwap": {
      "textOffsetEm": 0.3,
      "iconEnterScale": 0.6
    },
    "phoneInput": {
      "countryEnterTravelEm": 0.6,
      "countryExitTravelEm": 0.5,
      "listExitTravelPx": 6,
      "clearEnterScale": 0.6,
      "validExitScale": 0.8,
      "closedShapeTolerancePx": 0.25,
      "highlightInvisibleThreshold": 0.05
    },
    "emptyState": {
      "iconEnterScale": 0.92
    },
    "slider": {
      "digitColumnScale": 0.6,
      "digitColumnTravelEm": 0.3,
      "digitPitchEm": 1.05,
      "digitFadeExponent": 1.5,
      "digitFadeGain": 1.1,
      "digitBlurRatio": 0.75,
      "bubbleEnterScale": 0.6,
      "bubbleEnterOffsetPx": 6,
      "bubbleExitScale": 0.8,
      "bubbleExitOffsetPx": 4,
      "thumbLiftScale": 1.16,
      "bubbleLingerMs": 700,
      "edgeTravelPx": 9,
      "edgeResistance": 0.55,
      "edgeBumpVelocityPx": 150,
      "momentumStepMinPx": 12,
      "momentumProjectionSeconds": 0.099,
      "velocitySampleCount": 6,
      "velocityMinimumSeconds": 0.008,
      "velocityFreshnessMs": 60,
      "thumbChoiceThresholdPx": 2,
      "digitBlurRestDistance": 0.02
    },
    "otp": {
      "digitEnterTravelEm": 0.35,
      "digitExitScale": 0.9,
      "focusRingHiddenScale": 0.94,
      "invalidShakePx": [
        0,
        -6,
        5,
        -3,
        2,
        0
      ]
    },
    "popover": {
      "travelPx": 5,
      "enterScale": 0.97,
      "exitScale": 0.98,
      "exitTravelRatio": 0.5
    },
    "hoverCard": {
      "pageScrollShare": 0.9,
      "openDelayMs": 500,
      "closeDelayMs": 140,
      "skipWindowMs": 300,
      "warmIntentMs": 80,
      "enterTravelPx": 4,
      "enterScale": 0.96,
      "profileRowTravelPx": 4
    },
    "tooltip": {
      "delayMs": 250,
      "directOpenDelayMs": 0,
      "skipWindowMs": 300,
      "enterTravelPx": 3,
      "enterScale": 0.97,
      "exitScale": 0.98
    },
    "card": {
      "mediaHoverScale": 1.04,
      "closeEnterScale": 0.9,
      "closePressScale": 0.94,
      "detailEnterOffsetPx": 6,
      "returnTimeoutMs": 300,
      "hoverLiftPx": -2
    },
    "skeleton": {
      "pulseMinOpacity": 0.52,
      "pulseCycles": 2,
      "contentEnterOffsetPx": 4
    },
    "buttonGroup": {
      "transformTolerancePx": 1,
      "highlightSettleTolerancePx": 0.01,
      "activeLabelChangeWindowMs": 1000,
      "labelEnterOffsetPx": 4,
      "labelExitOffsetPx": -3,
      "widthMorphWindowMs": 700,
      "segmentPressScale": 0.97,
      "iconPressScale": 0.9,
      "menuEnterTravelPx": 5,
      "menuEnterScale": 0.97,
      "menuExitScale": 0.985,
      "menuExitTravelRatio": 0.5,
      "menuRowEnterTravelRatio": 0.4,
      "menuStaggerMax": 4
    },
    "toast": {
      "enterOffsetPx": 16,
      "enterScale": 0.96,
      "exitOffsetPx": 8,
      "exitScale": 0.97,
      "throwClearancePx": 48,
      "throwFallbackWidthPx": 320,
      "swipeDismissDistancePx": 80,
      "swipeDismissSpeedPxPerSecond": 480
    },
    "toastStack": {
      "peekPx": 14,
      "expandedGapPx": 12,
      "tuckedScaleStep": 0.05,
      "swipeFadeDistancePx": 280,
      "swipeFadeStrength": 0.75,
      "exitOffsetPx": 10,
      "exitScale": 0.96,
      "swipeDismissFraction": 0.4,
      "swipeClearancePx": 40,
      "swipeReverseVelocityLimitPx": 200,
      "swipeReturnVelocityRatio": 0.3,
      "swipeResistance": 0.55,
      "swipeProjectionSeconds": 0.099,
      "swipeStartDistancePx": 6,
      "velocitySampleWindowMs": 100,
      "velocitySampleMaxAgeMs": 60,
      "visibleToasts": 3,
      "proofPreviewVisibleToasts": 2
    },
    "dialog": {
      "enterOffsetPx": 8,
      "enterScale": 0.96,
      "exitOffsetPx": 4,
      "exitScale": 0.98
    },
    "checkbox": {
      "fillEnterScale": 0.6,
      "pressScale": 0.95
    },
    "radioGroup": {
      "dotEnterScale": 0.4,
      "pressScale": 0.88
    },
    "switch": {
      "pressStretchRatio": 0.2777777777777778,
      "pressContinuationWindowMs": 250,
      "changeStretch": [
        1,
        1.16,
        1
      ],
      "changeStretchTimes": [
        0,
        0.4,
        1
      ],
      "changeStretchEase": [
        "easeOut",
        "easeInOut"
      ]
    },
    "accordion": {
      "answerEnterOffsetPx": -6
    },
    "breadcrumb": {
      "crumbEnterOffsetPx": -8,
      "crumbExitOffsetPx": -4
    },
    "pagination": {
      "visiblePageLimit": 5,
      "stepPressScale": 0.96,
      "stepPressEase": "ease-out"
    },
    "tabs": {
      "pageScrollShare": 0.75,
      "scrollEdgeTolerancePx": 1,
      "panelEnterOffsetPx": 8,
      "panelExitOffsetPx": -6
    },
    "contextMenu": {
      "panelEnterScale": 0.96,
      "panelExitScale": 0.98,
      "rowEnterOffsetPx": -2
    },
    "menuValueSwap": {
      "exitTravelEm": 0.3,
      "dropdownLabelEnterTravelEm": 0.3,
      "selectValueEnterTravelEm": 0.35
    },
    "datePicker": {
      "panelEnterTravelPx": 8,
      "panelExitTravelPx": 6,
      "panelEnterScale": 0.95,
      "panelExitScale": 0.97,
      "footerActionPressScale": 0.97,
      "selectionSettleMs": 300
    },
    "dateRange": {
      "wordTravelEm": 0.45,
      "panelEnterTravelPx": -4,
      "panelExitTravelPx": -2,
      "monthEnterTravelPx": 48,
      "monthExitTravelPx": 36,
      "rangeEndpointHiddenScale": 0.8,
      "navPressScale": 0.92,
      "dayPressScale": 0.9,
      "presetVisibilityThreshold": 0.05
    },
    "calendar": {
      "navPressScale": 0.96,
      "dayPressScale": 0.94,
      "monthTitleTravelPx": 12,
      "selectionEnterScale": 0.6
    },
    "calendarNumberHandoff": {
      "numberArrivalBaseDelayMs": 95,
      "numberArrivalLogFactorMs": 85,
      "numberDepartureFloorDelayMs": 20,
      "numberDepartureDistanceFactorMs": 130
    },
    "shortcutRecorder": {
      "chipEnterScale": 0.72,
      "chipExitScale": 0.8,
      "chipTravelPx": 4,
      "placeholderTravelPx": 4,
      "recorderActionEnterScale": 0.6,
      "listClearEnterScale": 0.6,
      "messageTravelEm": 0.35,
      "breatheMinOpacity": 0.35,
      "settledFeedbackMs": 700
    },
    "calendarMonthPane": {
      "separationPx": 16,
      "maximumOpacityLoss": 0.6,
      "longJumpThresholdMonths": 2
    },
    "lineChart": {
      "legendPressScale": 0.97,
      "legendDisabledSwatchScale": 0.35,
      "tooltipEnterScale": 0.96,
      "loadingBreathMinOpacity": 0.22,
      "loadingBreathMaxOpacity": 0.45,
      "inViewAmount": 0.3
    },
    "streamgraph": {
      "legendPressScale": 0.97,
      "legendDisabledSwatchScale": 0.6,
      "inViewAmount": 0.3,
      "tooltipEnterScale": 0.96
    },
    "jsonViewer": {
      "maxAnimatedRows": 400,
      "copyFeedbackHoldMs": 1400,
      "copyGlyphScale": 0.6,
      "searchCounterTravelPx": 6
    },
    "commandPalette": {
      "entryOffsetPx": 6,
      "entryScale": 0.98,
      "clearScale": 0.6,
      "emptyEnterOffsetPx": 6,
      "emptyExitOffsetPx": -4,
      "glideRowLimit": 6
    },
    "holdToConfirmPresentation": {
      "defaultHoldMs": 1200,
      "proofHoldMs": 900,
      "completionVibrationMs": 12
    },
    "drawerPresentation": {
      "unmeasuredPanelSizePx": 480,
      "dismissTravelDivisor": 3,
      "dismissSpeedPxPerSecond": 500,
      "exitFadeStart": 0.65,
      "textTravelEm": 0.3
    },
    "swipeActions": {
      "dragSlopPx": 8,
      "projectionSeconds": 0.1,
      "flickSpeedPxPerSecond": 900,
      "edgeResistance": 0.55,
      "velocityWindowMs": 80,
      "velocitySampleLimit": 12,
      "commitClearancePx": 48,
      "commitWidthShare": 0.56,
      "homeVelocityPerPx": 12,
      "exitClearancePx": 2,
      "rearmTravelPx": 20,
      "vibrationMs": 8,
      "fallbackWidthPx": 320,
      "dragCaptureTolerancePx": 0.5,
      "openSnapShare": 0.5,
      "actionWidthPx": 76,
      "retainedRowRestoreMs": 1400,
      "iconRevealStart": 0.25,
      "iconRevealSpan": 0.55,
      "labelRevealStart": 0.72,
      "labelRevealSpan": 0.24,
      "iconStartScale": 0.6
    },
    "cookieConsent": {
      "faceEnterYPx": 10,
      "faceExitYPx": 4,
      "surfaceEnterYPx": 24,
      "surfaceExitYPx": 12,
      "surfaceEnterScale": 0.98,
      "surfaceExitScale": 0.96
    },
    "imageComparePresentation": {
      "handleRestPx": 40,
      "handleLongPx": 56,
      "handleShortPx": 36,
      "handleEdgeReservePx": 22,
      "chevronTravelPx": 4,
      "captionClearancePx": 8,
      "captionFadePx": 28,
      "captionHandoffFraction": 0.3333333333333333,
      "edgeStretchLimitPx": 9,
      "handleGiveLimitPx": 12,
      "limitKickSpeedPxPerSecond": 150,
      "edgeResistance": 0.55,
      "touchDragThresholdPx": 6
    },
    "donutChart": {
      "inViewAmount": 0.35,
      "readoutTravelEm": 0.45,
      "legendPressScale": 0.985
    },
    "floatingButtonGroup": {
      "labelEnterYPx": 4,
      "labelExitYPx": 3,
      "highlightVisibleThreshold": 0.15,
      "highlightEnterScale": 0.94,
      "highlightPressScale": 0.965,
      "tooltipDelayMs": 250,
      "tooltipSkipWindowMs": 300
    },
    "scrubInput": {
      "activationTravelPx": 3,
      "maximumStrainPx": 12,
      "overshootLimitPx": 90,
      "resistanceFactor": 0.55,
      "strainLeanShare": 0.5,
      "initialShellWidthPx": 160,
      "limitKickVelocityPxPerSecond": 260,
      "defaultPixelsPerStep": 2,
      "unitTravelPx": 6,
      "inlineBadgeTravelPx": 4,
      "inlineBadgeScale": 0.96,
      "cursorBadgeTravelPx": -2,
      "cursorBadgeScale": 0.9,
      "validationFeedbackMs": 900
    },
    "bottomSheetPresentation": {
      "defaultDetents": [
        0.45,
        0.92
      ],
      "extensionPx": 160,
      "closedClearancePx": 40,
      "projectionSeconds": 0.2,
      "flickSpeedPxPerSecond": 320,
      "stretchLimitPx": 120,
      "stretchResistance": 0.55,
      "stretchSingularityClearancePx": 1,
      "velocitySampleWindowMs": 80,
      "velocitySampleMaxAgeMs": 60,
      "velocitySampleLimit": 12,
      "initialOffscreenOffsetPx": 4000,
      "dragSlopPx": 3,
      "touchSlopPx": 4,
      "scrollEdgeTolerancePx": 1,
      "wheelExpandThresholdPx": 4,
      "focusEdgeClearancePx": 8,
      "arrowScrollPx": 48,
      "pageScrollShare": 0.85,
      "peekScrimShare": 0.78
    },
    "moneyInput": {
      "digitTravelEm": 0.55,
      "symbolEnterTravelEm": 0.4,
      "symbolExitTravelEm": 0.3,
      "limitKickVelocityPxPerSecond": 160,
      "limitFlashHoldMs": 1400,
      "currencyCheckEntryScale": 0.6,
      "quickAddPressScale": 0.96,
      "currencyPanelEntryScale": 0.96,
      "currencyPanelEntryOffsetPx": -4,
      "currencyPanelExitScale": 0.97,
      "currencyPanelExitOffsetPx": -2,
      "messageEntryTravelEm": 0.35
    },
    "colorPicker": {
      "initialPanelWidthPx": 300,
      "initialPanelHeightPx": 420,
      "initialTriggerWidthPx": 160,
      "initialTriggerHeightPx": 44,
      "springRestDelta": 0.0005,
      "springRestSpeed": 0.005,
      "clipStartRadiusPx": 22,
      "clipRadiusTravelPx": 4,
      "openBounce": 0.1,
      "contentFadeStart": 0.35,
      "contentFadeEnd": 0.9,
      "contentEnterOffsetPx": -10,
      "formatMorphHoldMs": 620,
      "invalidShakeOffsetsPx": [
        0,
        -5,
        4,
        -2,
        0
      ],
      "gradeEnterOffsetEm": 0.3,
      "swatchEnterScale": 0.4,
      "swatchDragScale": 1.15,
      "swatchDragElastic": 0.12,
      "headerPressScale": 0.94,
      "addPressScale": 0.92,
      "thumbActiveScale": 1.2,
      "selectedSwatchScale": 0.78
    },
    "fieldMessage": {
      "digitTravelEm": 0.6,
      "wordTravelEm": 0.35
    },
    "actionButton": {
      "press": {
        "wideButtonPx": 220,
        "regularScale": 0.97,
        "wideScale": 0.985
      },
      "labelEnterOffsetPx": 2,
      "statusEnterScale": 0.6,
      "arrowEnterOffsetPx": -6,
      "arrowExitOffsetPx": 8
    },
    "chatThreadBreathing": {
      "schemaVersion": 1,
      "rest": [
        0,
        60,
        100
      ],
      "peak": [
        30
      ]
    },
    "slopeChart": {
      "inViewAmount": 0.3,
      "rankTravelPx": 6,
      "tooltipStartScale": 0.96,
      "followStiffness": 480,
      "followDamping": 42,
      "followRestDelta": 0.01
    },
    "timePicker": {
      "popupEnterY": -6,
      "popupExitY": -4
    },
    "expandingButtonGroup": {
      "hoverInsetPx": 4,
      "labelMeasureTolerancePx": 0.5,
      "boxMeasureTolerancePx": 0.1,
      "hoverTravelTolerancePx": 1,
      "busyPulseMinOpacity": 0.45,
      "busyPulseCycles": 2,
      "labelExitXPx": 6,
      "textEnterEm": 0.5,
      "textExitEm": 0.4,
      "iconEnterScale": 0.55,
      "iconPressScale": 0.86,
      "confirmHoldMs": 1400
    },
    "mentionInput": {
      "popupTravelPx": 4,
      "popupScale": 0.96,
      "rowFitTolerancePx": 0.5
    },
    "waffleChart": {
      "inViewAmount": 0.35,
      "cellInitialScale": 0.4,
      "cellTravelDipScale": 0.62,
      "cellTravelDipTime": 0.42,
      "cellRevealDelayShare": 0.6,
      "followStiffness": 520,
      "followDamping": 44,
      "followRestDelta": 0.01,
      "tooltipStartScale": 0.96,
      "legendPressScale": 0.98
    },
    "rangeHistogram": {
      "thumbLiftScale": 1.18,
      "guideRestScale": 0.6,
      "edgeTravelPx": 10,
      "binSnapReachPx": 9
    },
    "reactions": {
      "kickSpring": {
        "stiffness": 420,
        "damping": 39
      },
      "kickScaleVelocity": 11,
      "kickRotateVelocity": -420,
      "digitOffsetEm": 0.55,
      "pillEnterScale": 0.5,
      "pillExitScale": 0.6,
      "glyphEnterScale": 0.6,
      "captionOffsetEm": 0.3,
      "pickerEnterScale": 0.5,
      "pickerExitScale": 0.9,
      "optionHoverScale": 1.14,
      "optionHoverOffsetPx": -1,
      "pressScale": 0.97
    },
    "billingToggle": {
      "swapTravelEm": 0.45,
      "optionPressScale": 0.97
    },
    "usageMeter": {
      "inViewAmount": 0.4,
      "iconBlurPx": 3
    },
    "ridgeline": {
      "inViewAmount": 0.3,
      "revealRowProgressStep": 0.025,
      "revealMaxDelayShare": 0.5,
      "tooltipHiddenScale": 0.96,
      "morphBounce": 0.08,
      "progressRestDelta": 0.0005,
      "progressRestSpeed": 0.001,
      "tooltipRestDeltaPx": 0.01
    },
    "fileDropzone": {
      "shakeEase": "easeOut",
      "thumbnailExitHoldMs": 600
    },
    "combobox": {
      "panelEnterTravelPx": 6,
      "panelExitTravelPx": 4,
      "emptyEnterTravelPx": 4
    },
    "brushChart": {
      "inViewAmount": 0.3,
      "gripActiveScaleY": 1.12,
      "tooltipHiddenScale": 0.96,
      "eventActiveScale": 1.3
    },
    "scrollArea": {
      "edgeTolerancePx": 0.5,
      "hideDelayMs": 900
    },
    "carousel": {
      "dragSlopPx": 6,
      "flickSpeedPxPerSecond": 360,
      "projectionRate": 0.995,
      "edgeResistance": 0.55,
      "velocitySampleWindowMs": 90,
      "velocitySampleMaxAgeMs": 50,
      "velocitySampleLimit": 16,
      "wheelLinePx": 16,
      "wheelEndDelayMs": 120,
      "captureTravelPx": 12,
      "neighborScale": 0.9,
      "neighborOpacity": 0.5,
      "pressScale": 0.97
    },
    "themeSwitch": {
      "eclipseOriginOffsetRatio": 0.25,
      "splitStartInset": "inset(0 50% 0 50%)",
      "splitEndInset": "inset(0 0% 0 0%)",
      "riseStartInset": "inset(100% 0 0 0)",
      "riseEndInset": "inset(0% 0 0 0)",
      "iconTurnDeg": 30,
      "iconHiddenScale": 0.7,
      "revealIconScale": 1.08,
      "eclipseIconOffsetPx": -2,
      "splitIconOffsetPx": 1,
      "riseIconOffsetPx": -2
    },
    "reorderableList": {
      "indexTravelEm": 0.5,
      "liftScale": 1.02,
      "keyboardLiftMs": 260,
      "dropBounceStiffness": 520,
      "dropBounceDamping": 40
    },
    "expandableCard": {
      "closeHoldSeconds": 0.06,
      "reversalWindowMs": 450,
      "wordEnterTravelEm": 0.35,
      "wordExitTravelEm": -0.3
    },
    "resizablePanels": {
      "stretchLimitPx": 44,
      "keyboardStepPx": 16,
      "keyboardLargeStepPx": 64,
      "edgeResistance": 0.55,
      "collapseShare": 0.5,
      "collapseMinimumPx": 40,
      "projectionRate": 0.99,
      "velocitySampleWindowMs": 90,
      "velocitySampleMaxAgeMs": 50,
      "velocitySampleLimit": 16,
      "widthReportTolerancePx": 0.1,
      "shareReportTolerancePercent": 0.05,
      "syncWidthTolerancePx": 0.5,
      "settleTolerancePx": 0.01,
      "catchTolerancePx": 0.75,
      "dragSlopPx": 2,
      "keyboardEdgeTolerancePx": 0.5,
      "restoreEnterScale": 0.6,
      "gripRestScale": 0.6
    },
    "sortableDataTable": {
      "stripRevealInsetPx": 8,
      "clearEnterScale": 0.96,
      "clearExitScale": 0.98,
      "clearPressScale": 0.97
    },
    "signaturePad": {
      "replayGapMinMs": 90,
      "replayGapMaxMs": 260,
      "replayBudgetMs": 3200,
      "replayEndHoldMs": 120,
      "savedFeedbackMs": 1800,
      "replayNibScale": 0.9,
      "swapScale": 0.6,
      "exportTravelPx": 4,
      "wipeFadeInAt": 0.12,
      "wipeFadeOutAt": 0.85,
      "pressScale": 0.94,
      "exportPressScale": 0.97
    },
    "chatThread": {
      "countTravelPx": 8,
      "attachmentHiddenScale": 0.9,
      "sendEnterTravelPx": 14,
      "sendExitTravelPx": 18,
      "messageEnterScale": 0.92,
      "messageEnterBlockTravelPx": 14,
      "messageEnterInlineTravelPx": 8,
      "typingHiddenScale": 0.9,
      "typingEnterTravelPx": 8,
      "jumpTravelPx": 12,
      "jumpHiddenScale": 0.94,
      "pickerEnterScale": 0.85,
      "pickerExitScale": 0.9,
      "pickerEnterTravelPx": 6,
      "pickerExitTravelPx": 4,
      "emojiEnterTravelPx": 6
    },
    "signupForm": {
      "stepEnterTravelPx": 24,
      "stepExitTravelPx": 16,
      "feedbackEnterTravelPx": 6,
      "feedbackExitTravelPx": 4
    },
    "logoMarquee": {
      "cycleDurationMs": 39000
    },
    "signIn": {
      "stepEnterTravelPx": 12,
      "stepExitTravelPx": 8
    },
    "emptyStates": {
      "textEnterPx": 8,
      "textExitPx": -6,
      "textDelaySeconds": 0.06
    },
    "richTextEditor": {
      "toolPressScale": 0.92,
      "toolbarEnterScale": 0.94,
      "toolbarExitScale": 0.96,
      "slashEnterScale": 0.96,
      "slashExitScale": 0.97,
      "surfaceEnterOffsetPx": 4,
      "faceTravelPx": 18,
      "faceBounce": 0.12
    },
    "loginCentered": {
      "stepEnterTravelPx": 12,
      "stepExitTravelPx": 8
    },
    "pageHeader": {
      "panelEnterTravelPx": 12,
      "panelExitTravelPx": 8,
      "breadcrumbsExitTravelPx": 8,
      "compactTitleEnterTravelPx": 14,
      "headingExitTravelPx": 10,
      "headingExitScale": 0.62,
      "descriptionExitTravelPx": 6,
      "checkAppearScale": 0.5,
      "emptyEntryTravelPx": 6,
      "noticeEntryTravelPx": 14,
      "noticeExitTravelPx": 8,
      "noticeDwellMs": 3200,
      "pointerHighlightGraceMs": 70
    },
    "siteHeader": {
      "hoverIntentMs": 70,
      "leaveGraceMs": 180,
      "faceSwitchTravelPx": 36,
      "faceExitShare": 0.6,
      "faceOpenTravelPx": 6,
      "panelEnterTravelPx": 6,
      "panelExitTravelPx": 4,
      "panelEnterScale": 0.985,
      "panelExitScale": 0.99,
      "toggleTurnDeg": 45,
      "toggleSwapScale": 0.8,
      "sheetItemTravelPx": 6,
      "featureHoverScale": 1.03,
      "featureArrowTravelPx": 2
    },
    "faqSection": {
      "answerExitPx": 6,
      "categoryEnterPx": 16,
      "categoryExitPx": 12,
      "emptyEnterPx": 8,
      "contactPressScale": 0.99,
      "clearPressScale": 0.97,
      "contactArrowTravelPx": 2
    },
    "siteFooter": {
      "feedbackTravelPx": 4,
      "wordmarkRevealFraction": 0.3,
      "wordmarkEnterPx": 40,
      "externalGlyphTravelPx": 1
    },
    "blogGrid": {
      "readerEnterPx": 12,
      "imagePressScale": 0.99,
      "imageHoverScale": 1.03,
      "pagePressScale": 0.97
    },
    "statsBand": {
      "markerEnterScale": 0.3
    },
    "morphSelect": {
      "valueEnterEm": 0.5,
      "valueExitEm": 0.45,
      "liftedValueExitEm": 0.3,
      "clearScale": 0.6,
      "checkScale": 0.6,
      "listExitPx": 6,
      "highlightInvisibleThreshold": 0.05
    },
    "motionGuide": {
      "listEnterTravelPx": 8
    },
    "contactSection": {
      "faceEnterTravelPx": 18,
      "faceExitTravelPx": 12
    },
    "cardStack": {
      "visibleCards": 4,
      "velocitySampleLimit": 12,
      "velocitySampleWindowMs": 80,
      "velocitySampleMaxAgeMs": 60,
      "verticalFreeTravelPx": 48,
      "verticalStretchLimitPx": 140,
      "verticalResistance": 0.55,
      "liftVerticalWeight": 0.5,
      "tiltResetDistancePx": 2,
      "fallbackCardWidthPx": 320,
      "keyboardThrowXPxPerSecond": 900,
      "keyboardThrowYPxPerSecond": -120,
      "throwHeadingMinSpeedPxPerSecond": 200,
      "throwHeadingMinTravelPx": 8,
      "throwHeadingVerticalWeight": 0.5,
      "throwHeadingVerticalBias": -0.12,
      "throwHeadingMinHorizontalShare": 0.45,
      "flickMinSpeedPxPerSecond": 500,
      "flickMinTravelPx": 12,
      "releaseWidthShare": 0.35,
      "releaseTravelCapPx": 140,
      "releaseReverseSpeedPxPerSecond": 300,
      "depthPeekPx": 12,
      "depthScaleStep": 0.05,
      "dragLiftSteps": 0.4,
      "liftDistancePx": 160,
      "rotationDegPerPx": 0.065,
      "shadeFullDepth": 2,
      "stampStartPx": 16,
      "stampFullPx": 96,
      "throwReachWidths": 1.6,
      "emptyEnterTravelPx": 8,
      "controlPressScale": 0.97
    },
    "onboardingChecklist": {
      "completedMoveDelayMs": 720,
      "labelTravelEm": 0.3,
      "countTravelEm": 0.45,
      "glyphSwapScale": 0.6,
      "uncheckedFillScale": 0.6,
      "checkPressScale": 0.92,
      "actionPressScale": 0.97
    },
    "rollingDigit": {
      "blurStartOffsetEm": 0.02
    }
  },
  "commentThread": {
    "schemaVersion": 1,
    "countRollPercent": 70,
    "reactionEnterScale": 0.7,
    "pickerEnterScale": 0.6,
    "actionShift": 6,
    "expandedRotation": 90,
    "heightCalibration": 1.2,
    "heightMass": 1
  },
  "changelog": {
    "rollPercent": 55,
    "monthTravel": 14,
    "entryExitScale": 0.98,
    "panelTravel": 8,
    "markerSelected": 16,
    "markerRest": 7,
    "tickRestScale": 0.4,
    "clearEnter": -6,
    "clearExit": -4,
    "chevronRotation": 180,
    "iconSize": 16,
    "tickSize": 11,
    "tickStroke": 2.6,
    "exportIconSize": 15,
    "scrollActivationInset": 28,
    "scrollEndTolerance": 2,
    "scrollTargetInset": 1
  },
  "notificationCenter": {
    "schemaVersion": 1,
    "textShiftEm": 0.3,
    "countShiftEm": 0.7,
    "iconEnterScale": 0.6,
    "dotEnterScale": 0.3,
    "bellRotation": -12,
    "emptyShift": 6,
    "morphWindowMs": 120,
    "cascadeCap": 0.2,
    "cascadeIndexCap": 7,
    "emptyCascadeIndex": 3
  },
  "menuHighlight": {
    "pointerGapGraceMs": 70
  },
  "layoutMeasurement": {
    "contentChangeWindowMs": 700
  },
  "compoundMenus": {
    "revealScale": 0.96,
    "stepTravel": 18,
    "textTravelEm": 0.3,
    "chipScale": 0.9,
    "countTravelEm": 0.5,
    "clearScale": 0.6,
    "panelTravel": 6,
    "panelScale": 0.96,
    "faceFadeEnd": 0.35,
    "contentFadeStart": 0.4,
    "contentFadeSpan": 0.5,
    "reflowBlockTolerance": 1,
    "reflowInlineTolerance": 40,
    "reflowWindowMs": 900,
    "typeaheadWindowMs": 700
  },
  "publicHeader": {
    "navigationSeconds": 0.2,
    "toggleSeconds": 0.15,
    "glassSeconds": 0.3,
    "timingFunction": "ease"
  },
  "roleDuration": {
    "feedback": 0.16,
    "enter": 0.24,
    "exit": 0.18,
    "replace": 0.24,
    "displayReveal": 0.48,
    "data": 0.64,
    "activity": 0.8,
    "breathing": 1.6,
    "themeReveal": 0.48,
    "emphasis": 0.48
  }
} as const;
