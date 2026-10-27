/**
 * @file components/Card.jsx
 * @overview 흰 카드 컨테이너. 추가 className을 병합해 확장 가능하다.
 */

/**
 * 흰 배경 카드 컨테이너.
 * @param {{ children: React.ReactNode, className?: string }} props
 */
export function Card({ children, className = "" }) {
  return <div className={`card ${className}`}>{children}</div>;	// 기본 card 클래스에 추가 클래스 병합
}
