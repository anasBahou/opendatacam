import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import raf from 'raf'
import { MODE } from '../../utils/constants'

import LiveViewEngine from './engines/LiveViewEngine'
import PathViewEngine from './engines/PathViewEngine';

// import GameEngineStateManager from '../../../statemanagement/app/GameEngineStateManager'

class CanvasEngine extends PureComponent {
  constructor (props) {
    super(props)
    this.lastFrameDrawn = -1

    this.loopUpdateCanvas = this.loopUpdateCanvas.bind(this)
  }

  componentDidMount () {
    this.loopUpdateCanvas();
  }

  clearCanvas () {
    this.canvasContext.clearRect(
      0,
      0,
      this.props.canvasResolution.w,
      this.props.canvasResolution.h
    )
  }

  loopUpdateCanvas () {
    if (this.lastFrameDrawn !== this.props.trackerData.frameIndex) {
      // Clear previous frame
      if(this.props.mode !== MODE.PATHVIEW) {
        this.clearCanvas();
      }

      /*
        Draw things for this frame
      */

      if(this.props.mode === MODE.LIVEVIEW) {
        LiveViewEngine.drawTrackerData(
          this.canvasContext,
          this.props.trackerData.data,
          this.props.canvasResolution,
          this.props.originalResolution
        )
      }

      if(this.props.mode === MODE.COUNTERVIEW) {
        LiveViewEngine.drawTrackerDataCounterEditor(
          this.canvasContext,
          this.props.trackerData.data,
          this.props.canvasResolution,
          this.props.originalResolution
        )
      }

      if(this.props.mode === MODE.PATHVIEW) {
        PathViewEngine.drawPaths(
          this.canvasContext,
          this.props.trackerData.data,
          this.props.canvasResolution,
          this.props.originalResolution
        )
      }

      this.lastFrameDrawn = this.props.trackerData.frameIndex;
    }
    raf(this.loopUpdateCanvas.bind(this))
  }

  render () {
    return (
      <div className={`canvas-container`}>
        {/* Canvas width and height must
        be set the the yolo detections resolution
        Then it is scaled down to viewport */}
        <canvas
          ref={el => {
            this.canvasEl = el
            if (this.canvasEl) {
              this.canvasContext = el.getContext('2d')
            }
          }}
          width={this.props.canvasResolution.w}
          height={this.props.canvasResolution.h}
          className='canvas'
        />
        <style jsx>{`
          .canvas-container {
            width: 100%;
            height: 100%;
            position: absolute;
            top: 0;
            left: 0;
            pointer-events: none;
          }
          .canvas {
            display: block;
            position: absolute;
            top: 0;
            left: 0;
            z-index: 2;
          }

          @media (min-aspect-ratio: 16/9) {
            .canvas {
              width: 100%;
              height: auto;
            }
          }

          @media (max-aspect-ratio: 16/9) {
            .canvas {
              width: auto;
              height: 100%;
            }
          }
        `}</style>
      </div>
    )
  }
}

export default connect(state => {

  return {
    trackerData: state.tracker.get('trackerData').toJS(),
    originalResolution: state.viewport.get('originalResolution').toJS(),
    canvasResolution: state.viewport.get('canvasResolution').toJS(),
    mode: state.app.get('mode')
  }
})(CanvasEngine)