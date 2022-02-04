import styled from "styled-components";

export const Header = styled.div`
  text-align: center;
  margin: 0 auto var(--space-xxxl);
  h3 {
    margin-bottom: var(--space-xs);
  }
`;

export const InfoTable = styled.div`
  display: flex;
  flex-direction: column;
  font-size: var(--font-size-m);
  gap: var(--space-xs);
  margin-bottom: var(--space-xxxl);

  div {
    display: flex;
    align-items: center;

    > span:first-child {
      width: 12rem;
    }
  }

  p {
    margin-top: 0;
  }

  input,
  select {
    flex: 1 0 auto;
    width: auto;
  }
`;

export const Methods = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-xl);
`;

export const AccountList = styled.ol`
  font-size: var(--font-size-s);
  padding: 0 0 0 var(--space-xl);
  margin: 0;

  li {
    margin: var(--space-xxs) 0;

    &:first-child {
      margin-top: 0;
    }
  }
`;

export const Button = styled.button`
  min-width: 4rem;
  font-size: var(--font-size-s);
  font-weight: bold;
  color: var(--color-text-main);
  background: var(--grey-lighter);
  border: 1px solid var(--grey-light);
  border-radius: 4px;
  margin-left: var(--space-xs);
  &:hover {
    background: var(--grey-lightest);
  }
  &[data-active="true"] {
    background: linear-gradient(319deg, #8bd2f6 0%, #f3e0c3 63%, #f7baba 100%);
    background-size: 6rem;
    border-color: #f3e0c3;
    transition: background 0.25s;
    cursor: default;

    &:hover {
      background-position: 100%;
    }
  }
`;
