import { Layout } from "../../components/Layout";
import { Eyebrow, LinkButton, TextLink } from "../../components/ui";

export default function NotFound() {
  return (
    <Layout area="public" page="not-found">
      <section className="py-24 md:py-32">
        <div className="container-page max-w-xl">
          <Eyebrow>404</Eyebrow>
          <h1 className="mt-2">이 페이지를 찾을 수 없어요.</h1>
          <p className="mt-4 text-ink/70">주소가 바뀌었거나 더 이상 존재하지 않는 페이지예요. 주소를 다시 확인하거나 홈으로 돌아가세요.</p>
          <div className="mt-8 flex flex-wrap items-center gap-6">
            <LinkButton to="/">홈으로 가기</LinkButton>
            <TextLink to="/user/my-coupons">내 쿠폰 보기</TextLink>
          </div>
        </div>
      </section>
    </Layout>
  );
}
