import { call, put, takeEvery, takeLatest } from 'redux-saga/effects';
import types from '../action_types/post';

function* fetchPost(action) {
    try {
        yield put({type: types.GET_POST_BEHIND});
        const user = yield fetch(`${process.env.REACT_APP_API_URL}posts?userId=${action.id}`).then((response) => response.json());
        yield put({type: types.GET_POST_SUCCESS, data: user});
    } catch (e) {
        yield put({type: types.GET_POST_ERROR, data: e.message});
    }
}

function* postSaga() {
    yield takeLatest(types.GET_POST, fetchPost);
}

export default postSaga;