import styled from "styled-components";

export const MethodWrapper = styled.div`
  display: flex;
  flex-direction: column;
  font-size: var(--font-size-l);
  background: white;
  padding: var(--space-m);
  border: 1px solid;
  border-radius: 0.4rem;
`;

export const Caption = styled.p`
  font-size: var(--font-size-m);
  margin-top: 0;
`;

export const Desc = styled.p`
  font-size: var(--font-size-s);
  line-height: 1.3;
  margin: 0 0 var(--space-xxs);
`;

export const Arg = styled.div`
  margin-bottom: var(--space-l);
  input {
    width: 100%;
    padding: var(--space-s) var(--space-m);
    margin: 0;
    border: 1px solid var(--grey);
    border-radius: 4px;
  }
`;

export const Footer = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-m);
`;

export const Button = styled.button`
  color: var(--grey-darkest);
  font-weight: bold;
  background: var(--color-primary);
  padding: var(--space-xs) var(--space-m);
  border: 1px solid transparent;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: var(--color-primary-light);
  }
`;

export const Return = styled.div`
  display: flex;
  align-items: flex-start;
  font-size: var(--font-size-s);
  column-gap: 0.2rem;

  ${Desc} {
    margin: 0;
  }
`;

export const ReturnHeader = styled.p`
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  margin: 0;
`;
