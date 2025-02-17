import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useDispatch } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';

import { notesActions } from 'modules/notes';
import { useNavigate } from 'react-router-dom';

import { modalActions } from 'modules/modal';
import { INote } from 'types';

const Container = styled.section`
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;

  box-sizing: border-box;
  padding: 30px;

  box-shadow: 0 3px 3px rgba(0, 0, 0, 0.2);

  border: 1px solid #eee;
  border-radius: 5px;

  .close_btn {
    display: grid;
    place-items: center;
    padding: 3px 0;

    width: 30px;
    height: 30px;

    position: absolute;
    top: 25px;
    right: 30px;

    background: none;
    border: none;
    border-radius: 10px;

    font-size: 1.5rem;

    cursor: pointer;

    transition: 0.1s;

    &:hover {
      background-color: #000;
      color: #fff;
      font-weight: bold;
    }
  }
`;

const Title = styled.h2`
  font-size: 1.3rem;
  font-weight: bold;
  margin-bottom: 20px;

  user-select: none;
`;

const NoteTitleWrapper = styled.div`
  margin-bottom: 20px;

  .title_input {
    width: 100%;
    height: 30px;

    border: none;
    outline: none;

    box-sizing: border-box;

    font-size: 1.2rem;
  }
`;

const KeywordsWrapper = styled.div`
  position: relative;

  min-height: 1.2rem;
  height: max-content;

  margin-bottom: 20px;

  display: flex;
  flex-wrap: wrap;
  gap: 8px;

  .keyword_input {
    width: max-content;
    font-size: 1rem;

    border: none;
    outline: none;

    &:focus + .notifiation::after {
      /* 인접 형제 선택자, 포커스된 인풋과 인접한 형제요소 .notifiation 의 가상 선택자를 선택함. */
      content: '엔터를 눌러 키워드를 추가할 수 있습니다. \\A 키워드를 클릭하여 삭제 할 수 있습니다.';
      white-space: pre;

      position: absolute;
      left: 0;
      bottom: -70px;
      padding: 10px;

      color: #fff;

      font-size: 0.8rem;
      line-height: 20px;

      background-color: #000;
    }
  }

  .keyword {
    font-size: 0.9rem;
    position: relative;
    min-width: 30px;
    width: max-content;
    padding: 5px 7px;

    text-align: center;
    background-color: #fff;
    border-radius: 100vmax;

    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);

    user-select: none;

    overflow: hidden;

    cursor: pointer;

    &:hover::before {
      content: '✕';
      line-height: 26px;
      position: absolute;
      top: 0;
      left: 0;

      display: block;

      width: 100%;
      height: 100%;

      background-color: #ffb9b9;

      animation: appear 0.1s linear;

      @keyframes appear {
        0% {
          opacity: 0;
        }

        100% {
          opacity: 1;
        }
      }
    }
  }
`;

const ContentWrapper = styled.div`
  margin-bottom: 10px;

  .content_input {
    width: 100%;
    height: 400px;

    box-sizing: border-box;
    padding: 10px;

    resize: none;

    border: 2px solid #ddd;
    border-radius: 5px;

    font-size: 1rem;

    &:focus {
      outline: none;
      border: 2px solid #000;
    }
  }
`;

const Notification = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;

  width: 100%;
  height: 30px;
  margin-bottom: 8px;
  font-size: 0.9rem;

  color: #777;
`;

const AddBtn = styled.button`
  padding: 5px 0;

  background: none;
  border: 2px solid #ddd;
  border-radius: 100vmax;

  font-size: 1rem;

  cursor: pointer;

  transition: 0.1s;

  &:hover {
    background-color: #000;
    color: #fff;
    border: 2px solid #000;
  }
`;

const DisabledBtn = styled(AddBtn)`
  background: #ddd;
  color: #eee;

  cursor: default;

  &:hover {
    background: #ddd;
    color: #eee;
    border: 2px solid #ddd;
  }
`;

function NoteEditor({
  note,
  onEdit,
}: {
  note: INote;
  onEdit: React.Dispatch<React.SetStateAction<INote>>;
}): JSX.Element {
  const dispatch = useDispatch();
  const nav = useNavigate();

  const {
    id: initialId,
    content: initialContent,
    keywords: initialKeywords,
    title: initialTitle,
  } = note;

  const [title, setTitle] = useState<string>(initialTitle);
  const [keywords, setKeywords] = useState<string[]>(initialKeywords);
  const [content, setContent] = useState<string>(initialContent);

  const [keywordValue, setKeywordValue] = useState<string>('');

  const addKeyword = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (
      keywordValue &&
      !keywords.includes(keywordValue) &&
      e.key === 'Enter' &&
      e.nativeEvent.isComposing === false
    ) {
      setKeywords([...keywords, keywordValue]);
      setKeywordValue('');
    }
  };

  const deleteKeyword = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    setKeywords(
      keywords.filter((keyword) => {
        return keyword !== e.currentTarget.innerText;
        // target 과 currentTarget 의 차이
        // tatget : 이벤트를 발생시킨 요소
        // currentTarget : 이벤트를 가지고 있는 요소
        // 미묘하지만 큰 차이임!
      })
    );
  };

  const openEditDoneModal = () => {
    dispatch(
      modalActions.openModal({
        msg: '수정이 완료되었습니다.',
        type: 'single',
        applyFn: () => {
          modalActions.closeModal();
        },
      })
    );
  };

  const onEditApply = () => {
    dispatch(
      notesActions.updateNote({
        id: initialId,
        title,
        keywords,
        content,
      })
    );
    onEdit({ id: initialId, title, keywords, content });

    openEditDoneModal();
    nav('/memory/view');
  };

  return (
    <Container>
      <Title>노트 수정하기</Title>
      <button
        type="button"
        className="close_btn"
        onClick={() => nav('/memory/view')}
      >
        ✕
      </button>

      {/* 제목 */}
      <NoteTitleWrapper>
        <input
          type="text"
          value={title}
          className="title_input"
          placeholder="제목을 입력하세요"
          spellCheck={false}
          onChange={(e) => setTitle(e.target.value)}
        />
      </NoteTitleWrapper>

      {/* 키워드 */}
      <KeywordsWrapper>
        {/* 키워드 표시 */}
        {keywords?.map((keyword) => {
          return (
            <div
              className="keyword"
              role="button"
              key={uuidv4()}
              aria-hidden="true"
              onClick={(e) => deleteKeyword(e)}
            >
              {keyword}
            </div>
          );
        })}

        {/* 키워드 입력 */}
        <input
          type="text"
          className="keyword_input"
          spellCheck={false}
          placeholder="키워드를 입력하세요"
          value={keywordValue}
          onChange={(e) => setKeywordValue(e.currentTarget.value)}
          onKeyDown={(e) => addKeyword(e)}
        />
        <div className="notifiation" />
      </KeywordsWrapper>

      {/* 본문 */}
      <ContentWrapper>
        <textarea
          placeholder="내용을 작성해주세요."
          className="content_input"
          value={content}
          spellCheck={false}
          onChange={(e) => setContent(e.target.value)}
        />
      </ContentWrapper>

      {/* 작성 필드 안내 */}
      <Notification>
        <div className="alert_msg">
          {!title && !content ? '제목과 내용을 작성해주세요.' : null}
        </div>
        <div className="alert_msg">
          {title && !content ? '내용을 작성해주세요.' : null}
        </div>
        <div className="alert_msg">
          {!title && content ? '제목을 작성해주세요.' : null}
        </div>
      </Notification>

      {/* 노트 추가 버튼 */}
      {title && content ? (
        <AddBtn type="button" onClick={onEditApply}>
          수정완료
        </AddBtn>
      ) : (
        <DisabledBtn>수정완료</DisabledBtn>
      )}
    </Container>
  );
}

export default NoteEditor;
