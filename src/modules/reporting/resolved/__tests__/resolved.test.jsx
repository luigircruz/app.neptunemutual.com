import { useRouter } from 'next/router'
import { fireEvent, screen } from '@/utils/unit-tests/test-utils'
import { initiateTest, mockFn } from '@/utils/unit-tests/test-mockup-fn'
import { ReportingResolvedPage } from '@/modules/reporting/resolved/resolved'
import { testData } from '@/utils/unit-tests/test-data'

const initialMocks = () => {
  // mockFn.useRouter();
  mockFn.useNetwork()
  mockFn.useResolvedReportings()
  mockFn.useSortableStats()
}

jest.mock('next/router', () => ({
  useRouter: jest.fn()
}))

describe('ResolvedReportingPage test', () => {
  const push = jest.fn()
  useRouter.mockImplementation(() => ({
    push,
    pathname: '/',
    route: '/',
    asPath: '/',
    query: ''
  }))

  const { initialRender } = initiateTest(
    ReportingResolvedPage,
    {},
    initialMocks
  )

  beforeEach(() => {
    initialRender()
  })

  test('should render the table with five headers', () => {
    const wrapper = screen.getByRole('table')
    const tableHeaders = wrapper.getElementsByTagName('th')
    expect(wrapper).toBeInTheDocument()
    expect(tableHeaders.length).toBe(5)
  })

  test('should render search and sort bar', () => {
    const searchAndSort = screen.getByTestId('search-and-sort-container')
    expect(searchAndSort).toBeInTheDocument()
  })

  test('should render no of icidents', () => {
    expect(screen.getAllByRole('row').length).toBe(
      testData.resolvedReportings.data.incidentReports.length + 1
    )
  })

  test('should take us to diversified and standalone reportaccordingly if clicked on row', () => {
    const row = screen.getAllByRole('row')
    fireEvent.click(row[1])
    fireEvent.click(row[2])

    expect(push).toHaveBeenCalledTimes(2)
  })
})
