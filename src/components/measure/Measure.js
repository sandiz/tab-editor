import React, { Component } from 'react';
import { connect } from 'react-redux';
import shouldPureComponentUpdate from 'react-pure-render/function';
import { finalMeasureSelector } from '../../util/selectors';

import MusicMeasure from './MusicMeasure';
import TabMeasure from './TabMeasure';
import MeasureSelectBox from './MeasureSelectBox';

const MEASURE_HEIGHT = 210;

class Measure extends Component {
  shouldComponentUpdate = shouldPureComponentUpdate;

  render() {
    const { playingNoteIndex, measureLength, measureIndex, measure, tuning, isValid, selected } = this.props;

    return (
      <svg style={{ height: MEASURE_HEIGHT + (tuning.length * 20), width: measure.width }}>
        <MusicMeasure {...this.props} measureHeight={MEASURE_HEIGHT} y={65} />
        <TabMeasure measure={measure} playingNoteIndex={playingNoteIndex} measureIndex={measureIndex}
          measureLength={measureLength} isValid={isValid} stringCount={tuning.length} displayOption='both'
          y={MEASURE_HEIGHT} />
        <MeasureSelectBox measureWidth={measure.width} selected={selected} height={MEASURE_HEIGHT + (tuning.length * 20)}/>
      </svg>
    );
  }
}

export default connect(finalMeasureSelector)(Measure);
