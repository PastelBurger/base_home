export interface LinkItem {
  id: string;
  name: string;
  url: string;
  highlighted?: boolean;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  links: LinkItem[];
}

export const categories: Category[] = [
  {
    id: 'gov',
    name: '정부사업검색',
    color: '#0284c7', // sky-600
    links: [
      { id: 'ripc', name: '지역지식재산센터', url: 'https://pms.ripc.org/main.do' },
      { id: 'ipnavi1', name: '지식재산 보호원(기업-특허)', url: 'https://www.ip-navi.or.kr/starklogin/announce.navi' },
      { id: 'ipnavi2', name: '지식재산 보호원(협력기관)', url: 'https://www.ip-navi.or.kr/cooperation/poolBiddingList.navi' },
      { id: 'kista1', name: '특허 전략 개발원(사업공고)', url: 'https://biz.kista.re.kr/ippro//com/iprndMain/selectBusinessAnnounceList.do?bbsType=bs' },
      { id: 'kista2', name: '특허 전략 개발원(협력기관공고)', url: 'https://biz.kista.re.kr/ippro/com/iprndMain/selectBusinessAnnounceList.do?bbsType=ac' },
    ]
  },
  {
    id: 'internal',
    name: '내부서비스',
    color: '#16a34a', // green-600
    links: [
      { id: 'duedate', name: '내부기일관리', url: 'https://due-date-manage-production.up.railway.app/', highlighted: true },
      { id: 'homepage', name: '홈페이지', url: 'https://www.iplp.co.kr' },
      { id: 'blog', name: '블로그', url: 'https://blog.naver.com/iplplaw' },
      { id: 'techipo', name: '기특상 랜딩페이지', url: 'https://tech-ipo.iplp.kr/' },
      { id: 'techtest', name: '기특상 자가진단', url: 'https://tech-test.iplp.kr/' },
      { id: 'patent', name: '특허홍보 랜딩페이지', url: 'https://patent.iplp.kr/' },
      { id: 'pdftoword', name: 'PDF to Word', url: 'https://pdftotext-production-f148.up.railway.app' },
      { id: 'meeting', name: '회의실 예약', url: 'https://eggstation.spacebring.com/suite/organizations/26837bc0-76ea-11ee-b697-57aa4850a640/rooms' },
    ]
  },
  {
    id: 'search',
    name: '특허검색',
    color: '#9333ea', // purple-600
    links: [
      { id: 'keywert', name: '키워트', url: 'https://www.keywert.com/' },
      { id: 'kipris', name: '키프리스', url: 'https://www.kipris.or.kr/khome/main.do' },
      { id: 'ustm', name: '미국상표', url: 'https://tmsearch.uspto.gov/search/search-information' },
    ]
  }
];
